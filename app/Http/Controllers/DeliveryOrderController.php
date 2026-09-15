<?php

namespace App\Http\Controllers;

use App\Http\Requests\DeliveryOrderRequest;
use App\Models\DeliveryOrder;
use App\Models\DeliveryOrderLine;
use App\Models\SalesOrder;
use App\Models\StockOrderTransfer;
use App\Models\WorkOrder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DeliveryOrderController extends Controller implements HasMiddleware
{
    /**
     * What a despatch can be raised against, keyed by the value the legacy
     * loading_note.type column holds.
     *
     * @var array<string, array{model: class-string<Model>, label: string}>
     */
    private const SOURCES = [
        'salesorder' => ['model' => SalesOrder::class, 'label' => 'Sales order'],
        'workorder' => ['model' => WorkOrder::class, 'label' => 'Work order'],
        'stockordertransfer' => ['model' => StockOrderTransfer::class, 'label' => 'Stock order transfer'],
    ];

    /**
     * @return array<int, Middleware|string>
     */
    public static function middleware(): array
    {
        return [
            'auth',
            new Middleware('permission:do-list', only: ['index', 'show']),
            new Middleware('permission:do-create', only: ['create', 'store']),
        ];
    }

    public function index(Request $request): Response
    {
        // Only despatches against a sales order can name their client; work
        // orders and stock order transfers are not ported yet.
        $orders = DeliveryOrder::query()
            ->leftJoin('sales_orders', function ($join) {
                $join->on('loading_note.salesorder', '=', 'sales_orders.id')
                    ->where('loading_note.type', '=', 'salesorder');
            })
            ->leftJoin('company_details', 'sales_orders.customer_no', '=', 'company_details.id')
            ->select([
                'loading_note.id',
                'loading_note.type',
                'loading_note.salesorder',
                'loading_note.customer_order',
                'loading_note.total_fsd_items',
                'loading_note.delivered_fsd_items',
                'loading_note.status',
                'loading_note.created_at',
                'company_details.cname as client',
            ])
            ->orderByDesc('loading_note.id')
            ->get();

        return Inertia::render('delivery-orders/index', [
            'orders' => $orders,
            'can' => [
                'edit' => $request->user()->can('do-edit'),
                'create' => $request->user()->can('do-create'),
            ],
        ]);
    }

    /**
     * Picking what to despatch, in the order the legacy screen asks for it:
     * a month, then one of that month's orders, then its lines. Sales orders,
     * work orders and stock order transfers each get their own pair.
     */
    public function create(Request $request): Response
    {
        $filters = $request->validate([
            'type' => ['nullable', Rule::in(array_keys(self::SOURCES))],
            'month' => ['nullable', 'date_format:Y-m'],
            'order' => ['nullable', 'integer'],
        ]);

        $type = $filters['type'] ?? 'salesorder';
        $month = $filters['month'] ?? null;
        $model = self::SOURCES[$type]['model'];

        $orders = $month === null ? collect() : $model::query()
            ->with('client:id,cname')
            ->whereYear('created_at', substr($month, 0, 4))
            ->whereMonth('created_at', substr($month, 5, 2))
            ->orderByDesc('id')
            ->get()
            ->map(fn (Model $order) => [
                'id' => $order->id,
                'customer_order' => $order->customer_order,
                'client' => $order->client?->cname,
            ]);

        $order = isset($filters['order'])
            ? $model::with(['lines', 'client'])->find($filters['order'])
            : null;

        return Inertia::render('delivery-orders/form', [
            'sources' => collect(self::SOURCES)
                ->map(fn (array $source, string $key) => ['value' => $key, 'label' => $source['label']])
                ->values(),
            'type' => $type,
            'month' => $month,
            'orders' => $orders,
            'order' => $order === null ? null : [
                ...$order->only([
                    'id', 'customer_order', 'contact_person', 'mode_of_shipment',
                    'remarks', 'created_at',
                ]),
                'client' => $order->client?->only([
                    'cname', 'address', 'state', 'country', 'phone', 'fax',
                ]),
            ],
            'lines' => $order === null ? [] : $this->despatchableLines($type, $order),
        ]);
    }

    public function store(DeliveryOrderRequest $request): RedirectResponse
    {
        $type = $request->validated('type');
        $model = self::SOURCES[$type]['model'];
        $order = $model::with('lines')->findOrFail($request->validated('order'));

        $outstanding = collect($this->despatchableLines($type, $order))->keyBy('id');

        // Only lines with something left to send, so a stale tick on a line
        // another despatch has since cleared cannot send it twice.
        $sending = collect($request->validated('lines'))
            ->map(fn (int $id) => $outstanding->get($id))
            ->filter(fn (?array $line) => ($line['outstanding'] ?? 0) > 0);

        if ($sending->isEmpty()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Every line ticked has already been delivered.',
            ]);

            return back();
        }

        $deliveryOrder = DB::transaction(function () use ($request, $type, $order, $sending) {
            $deliveryOrder = DeliveryOrder::create([
                'type' => $type,
                'salesorder' => $order->id,
                'customer_order' => $request->validated('customer_order') ?? $order->customer_order,
                // Both counts are of lines, as the legacy screen records them.
                'total_fsd_items' => $order->lines->count(),
                'delivered_fsd_items' => $sending->count(),
                'status' => 'valid',
            ]);

            foreach ($sending as $line) {
                $source = $order->lines->firstWhere('id', $line['id']);

                $deliveryOrder->lines()->create([
                    'item' => $source->item,
                    'poitem' => $source->polineitem,
                    'quantity' => $line['outstanding'],
                    'actual_qty' => $line['outstanding'],
                    'product' => $source->product,
                    'description' => $source->description,
                    'postock_code' => $source->postock_code,
                    'stockcode' => $source->stock_code,
                    'std_stockcode' => $source->std_stockcode,
                    'unit_price' => $source->unit_price,
                    'weight' => $source->weight,
                    'sst' => $source->sst ?? 0,
                ]);
            }

            return $deliveryOrder;
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Delivery order created.']);

        return to_route('delivery-order.show', $deliveryOrder);
    }

    /**
     * Each line of the order with the despatches that already covered it: the
     * note numbers, how much they sent, and what is left.
     *
     * @return array<int, array<string, mixed>>
     */
    private function despatchableLines(string $type, Model $order): array
    {
        $sent = DB::table('loading_note_content')
            ->join('loading_note', 'loading_note.id', '=', 'loading_note_content.do_id')
            ->where('loading_note.type', $type)
            ->where('loading_note.salesorder', $order->id)
            ->where(fn ($query) => $query->where('loading_note.status', '!=', 'invalid')
                ->orWhereNull('loading_note.status'))
            ->get([
                'loading_note_content.item',
                'loading_note_content.do_id',
                'loading_note_content.actual_qty',
            ])
            ->groupBy('item');

        return $order->lines->map(function (Model $line) use ($sent) {
            $despatches = $sent->get($line->item, collect());
            $alreadySent = (int) $despatches->sum('actual_qty');

            return [
                'id' => $line->id,
                'item' => $line->item,
                'product' => $line->product,
                'stock_code' => $line->stock_code,
                'description' => $line->description,
                'quantity' => (int) $line->quantity,
                'unit' => $line->unit,
                'delivery_orders' => $despatches->pluck('do_id')->map(fn ($id) => (int) $id)->unique()->values()->all(),
                'already_sent' => $alreadySent,
                'outstanding' => max((int) $line->quantity - $alreadySent, 0),
            ];
        })->all();
    }

    public function show(DeliveryOrder $deliveryOrder): Response
    {
        $deliveryOrder->load('lines');

        $salesOrder = $deliveryOrder->isForSalesOrder()
            ? $deliveryOrder->salesOrder()->with('client:id,cname')->first()
            : null;

        return Inertia::render('delivery-orders/show', [
            'order' => [
                ...$deliveryOrder->only([
                    'id', 'type', 'salesorder', 'customer_order',
                    'total_fsd_items', 'delivered_fsd_items', 'status', 'created_at',
                ]),
                'complete' => $deliveryOrder->isComplete(),
                'client' => $salesOrder?->client?->cname,
                'sales_order_id' => $salesOrder?->id,
                // A despatch can be listed on a packing list; show which.
                'packing_lists' => DB::table('packinglist_content')
                    ->where('do_id', $deliveryOrder->id)
                    ->distinct()
                    ->pluck('packingid'),
            ],
            'lines' => $deliveryOrder->lines->map(fn (DeliveryOrderLine $line) => [
                ...$line->only([
                    'id', 'item', 'poitem', 'product', 'stockcode', 'std_stockcode',
                    'postock_code', 'description', 'quantity', 'actual_qty',
                    'unit_price', 'weight', 'sst',
                ]),
                'line_total' => $line->lineTotal(),
            ]),
            'totals' => $deliveryOrder->totals(),
        ]);
    }
}
