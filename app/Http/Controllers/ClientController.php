<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClientRequest;
use App\Models\Client;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller implements HasMiddleware
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
        $salespeople = User::query()
            ->where('department', 'Sales')
            ->orderBy('name')
            ->get(['id', 'name']);

        $names = User::query()->pluck('name', 'id');

        $addressCounts = DB::table('delivery_address')
            ->groupBy('company_detail_id')
            ->selectRaw('company_detail_id, count(*) as addresses')
            ->pluck('addresses', 'company_detail_id');

        $clients = Client::query()
            ->orderBy('cname')
            ->get()
            ->map(fn (Client $client) => [
                ...$client->only([
                    'id', 'cname', 'regno', 'gst_regno', 'address', 'city', 'state',
                    'country', 'phone', 'fax', 'attn', 'client_email', 'user_email',
                    'cstatus', 'payment_terms', 'status',
                ]),
                'delivery_addresses_count' => (int) ($addressCounts[$client->id] ?? 0),
                // Older rows hold a username in user_email rather than an id,
                // so fall back to whatever the column holds.
                'salesperson' => $names[$client->user_email] ?? $client->user_email,
            ]);

        return Inertia::render('clients/index', [
            'clients' => $clients,
            'salespeople' => $salespeople,
            'can' => [
                'create' => $request->user()->can('company-create'),
                'edit' => $request->user()->can('company-edit'),
                'delete' => $request->user()->can('company-delete'),
            ],
        ]);
    }

    public function store(ClientRequest $request): RedirectResponse
    {
        Client::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Client created.']);

        return back();
    }

    public function update(ClientRequest $request, Client $client): RedirectResponse
    {
        $client->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Client updated.']);

        return back();
    }

    public function destroy(Client $client): RedirectResponse
    {
        if ($client->deliveryAddresses()->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'That client still has delivery addresses.',
            ]);

            return back();
        }

        if (DB::table('quote_refs')->where('company_details_id', $client->id)->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'That client is referenced by quotations.',
            ]);

            return back();
        }

        $client->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Client deleted.']);

        return back();
    }
}
