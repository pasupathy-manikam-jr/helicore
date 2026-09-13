<?php

namespace App\Http\Controllers;

use App\Http\Requests\DeliveryAddressRequest;
use App\Models\Client;
use App\Models\DeliveryAddress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DeliveryAddressController extends Controller implements HasMiddleware
{
    /**
     * @return array<int, Middleware|string>
     */
    public static function middleware(): array
    {
        return [
            'auth',
            new Middleware('permission:company-list', only: ['index']),
            new Middleware('permission:company-create', only: ['store']),
            new Middleware('permission:company-edit', only: ['update']),
            new Middleware('permission:company-delete', only: ['destroy']),
        ];
    }

    public function index(Request $request): Response
    {
        $addresses = DeliveryAddress::query()
            ->with('client:id,cname')
            ->orderBy('customer_name')
            ->get()
            ->map(fn (DeliveryAddress $address) => [
                ...$address->only([
                    'id', 'company_detail_id', 'customer_name', 'email', 'address',
                    'city', 'state', 'country', 'location_type', 'fax', 'telephone',
                ]),
                'client_name' => $address->client?->cname,
            ]);

        return Inertia::render('client-delivery/index', [
            'addresses' => $addresses,
            'clients' => Client::query()->orderBy('cname')->get(['id', 'cname']),
            'can' => [
                'create' => $request->user()->can('company-create'),
                'edit' => $request->user()->can('company-edit'),
                'delete' => $request->user()->can('company-delete'),
            ],
        ]);
    }

    public function store(DeliveryAddressRequest $request): RedirectResponse
    {
        DeliveryAddress::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Delivery address created.']);

        return back();
    }

    public function update(DeliveryAddressRequest $request, DeliveryAddress $deliveryAddress): RedirectResponse
    {
        $deliveryAddress->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Delivery address updated.']);

        return back();
    }

    public function destroy(DeliveryAddress $deliveryAddress): RedirectResponse
    {
        // Sales orders point at the address by id, so removing one would leave
        // the order without somewhere to ship to.
        if (DB::table('sales_orders')->where('delivery_address', $deliveryAddress->id)->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'That address is used by sales orders.',
            ]);

            return back();
        }

        $deliveryAddress->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Delivery address deleted.']);

        return back();
    }
}
