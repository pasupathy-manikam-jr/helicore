<?php

use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AfeApprovalFlowController;
use App\Http\Controllers\AfeController;
use App\Http\Controllers\AfeLineController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CocController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeliveryAddressController;
use App\Http\Controllers\DeliveryOrderController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\PackingListController;
use App\Http\Controllers\ProformaController;
use App\Http\Controllers\QuotationController;
use App\Http\Controllers\QuotationLineController;
use App\Http\Controllers\ReceivingNoteController;
use App\Http\Controllers\Reference\CurrencyController;
use App\Http\Controllers\Reference\ModeOfShipmentController;
use App\Http\Controllers\Reference\PermissionController;
use App\Http\Controllers\Reference\TariffController;
use App\Http\Controllers\Reference\TaxController;
use App\Http\Controllers\Reference\TncController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SalesOrderController;
use App\Http\Controllers\SalesOrderLineController;
use App\Http\Controllers\StockCodeController;
use App\Http\Controllers\StockOrderTransferController;
use App\Http\Controllers\SupplierCategoryController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\WorkOrderController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => to_route('dashboard'))->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::resource('client', ClientController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::resource('client-delivery', DeliveryAddressController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->parameters(['client-delivery' => 'deliveryAddress']);

    Route::resource('quotation', QuotationController::class)
        ->only(['index', 'create', 'store', 'show', 'edit', 'update']);
    Route::get('quotation/{quotation}/attachment/{index}', [QuotationController::class, 'attachment'])
        ->name('quotation.attachment');

    Route::resource('quotation.line', QuotationLineController::class)
        ->only(['store', 'update', 'destroy']);

    // Stock codes live in one table per product line, so the product travels
    // in the path rather than through route model binding.
    Route::get('stock-code', [StockCodeController::class, 'index'])
        ->name('stock-code.index');
    Route::put('stock-code/{product}/{id}', [StockCodeController::class, 'update'])
        ->name('stock-code.update');

    Route::resource('sales-order', SalesOrderController::class)
        ->only(['index', 'create', 'store', 'show', 'edit', 'update'])
        ->parameters(['sales-order' => 'salesOrder']);

    Route::get('sales-order/{salesOrder}/confirmation', [SalesOrderController::class, 'confirmation'])
        ->name('sales-order.confirmation');

    Route::resource('sales-order.line', SalesOrderLineController::class)
        ->only(['store', 'update', 'destroy'])
        ->parameters(['sales-order' => 'salesOrder']);
    Route::post('sales-order/{salesOrder}/copy-quotation', [SalesOrderLineController::class, 'copy'])
        ->name('sales-order.copy-quotation');

    Route::resource('work-order', WorkOrderController::class)
        ->only(['index', 'show'])
        ->parameters(['work-order' => 'workOrder']);

    Route::resource('stock-transfer', StockOrderTransferController::class)
        ->only(['index', 'show'])
        ->parameters(['stock-transfer' => 'stockTransfer']);

    Route::resource('invoice', InvoiceController::class)->only(['index', 'show']);

    Route::resource('proforma', ProformaController::class)->only(['index', 'show']);

    Route::resource('delivery-order', DeliveryOrderController::class)
        ->only(['index', 'show'])
        ->parameters(['delivery-order' => 'deliveryOrder']);

    Route::resource('coc', CocController::class)->only(['index', 'show']);

    Route::resource('packing-list', PackingListController::class)
        ->only(['index', 'show'])
        ->parameters(['packing-list' => 'packingList']);

    Route::resource('afe', AfeController::class)
        ->only(['index', 'create', 'store', 'show', 'edit', 'update']);

    Route::resource('afe.line', AfeLineController::class)
        ->only(['store', 'update', 'destroy']);
    Route::post('afe/{afe}/approve', [AfeController::class, 'approve'])
        ->name('afe.approve');

    Route::resource('afe-workflow', AfeApprovalFlowController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->parameters(['afe-workflow' => 'afeWorkflow']);

    Route::get('report/stock-sold', [ReportController::class, 'stockSold'])
        ->name('report.stock-sold');

    Route::get('receiving-note/create/{afe}', [ReceivingNoteController::class, 'create'])
        ->name('receiving-note.create');

    Route::resource('receiving-note', ReceivingNoteController::class)
        ->only(['index', 'store', 'show'])
        ->parameters(['receiving-note' => 'receivingNote']);

    Route::resource('supplier', SupplierController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::resource('supplier-category', SupplierCategoryController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('user', UserController::class)
            ->only(['index', 'store', 'update', 'destroy']);

        Route::resource('role', RoleController::class)
            ->only(['index', 'store', 'update', 'destroy']);

        Route::resource('permission', PermissionController::class)
            ->only(['index', 'store', 'update', 'destroy']);
    });

    // Utilities: small reference tables, all served by ReferenceController.
    $reference = [
        'currency' => CurrencyController::class,
        'tariff' => TariffController::class,
        'mode-of-shipment' => ModeOfShipmentController::class,
        'tax' => TaxController::class,
        'terms' => TncController::class,
    ];

    foreach ($reference as $path => $controller) {
        Route::resource($path, $controller)
            ->only(['index', 'store', 'update', 'destroy']);
    }
});

require __DIR__.'/settings.php';
