<?php

namespace App\Http\Controllers;

use App\Http\Requests\AfeApprovalFlowRequest;
use App\Models\AfeApprovalFlow;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response;

class AfeApprovalFlowController extends Controller implements HasMiddleware
{
    /**
     * @return array<int, Middleware|string>
     */
    public static function middleware(): array
    {
        return [
            'auth',
            new Middleware('permission:afe-workflow-index', only: ['index']),
            new Middleware('permission:afe-workflow-create', only: ['store']),
            new Middleware('permission:afe-workflow-edit', only: ['update']),
            new Middleware('permission:afe-workflow-delete', only: ['destroy']),
        ];
    }

    public function index(Request $request): Response
    {
        $stages = AfeApprovalFlow::query()
            ->with(['approver:id,name', 'forwardTo:id,name'])
            ->orderBy('stage')
            ->orderBy('approving_limit_start')
            ->get()
            ->map(fn (AfeApprovalFlow $stage) => [
                ...$stage->only([
                    'id', 'approver_id', 'approving_limit_start',
                    'approving_limit', 'stage', 'forwardStatus',
                ]),
                'approver' => $stage->approver?->name,
                'forward_to' => $stage->forwardTo?->name,
            ]);

        return Inertia::render('afe-workflow/index', [
            'stages' => $stages,
            'managers' => User::query()
                ->where('position', 'Manager')
                ->orderBy('name')
                ->get(['id', 'name']),
            'can' => [
                'create' => $request->user()->can('afe-workflow-create'),
                'edit' => $request->user()->can('afe-workflow-edit'),
                'delete' => $request->user()->can('afe-workflow-delete'),
            ],
        ]);
    }

    public function store(AfeApprovalFlowRequest $request): RedirectResponse
    {
        AfeApprovalFlow::create($request->flowAttributes());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Approval stage added.']);

        return back();
    }

    public function update(AfeApprovalFlowRequest $request, AfeApprovalFlow $afeWorkflow): RedirectResponse
    {
        $afeWorkflow->update($request->flowAttributes());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Approval stage updated.']);

        return back();
    }

    public function destroy(AfeApprovalFlow $afeWorkflow): RedirectResponse
    {
        $afeWorkflow->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Approval stage removed.']);

        return back();
    }
}
