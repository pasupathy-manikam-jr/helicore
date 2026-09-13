<?php

use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeliveryAddressController;
use App\Http\Controllers\QuotationController;
use App\Http\Controllers\QuotationLineController;
use App\Http\Controllers\Reference\CurrencyController;
use App\Http\Controllers\Reference\ModeOfShipmentController;
use App\Http\Controllers\Reference\PermissionController;
use App\Http\Controllers\Reference\TariffController;
use App\Http\Controllers\Reference\TaxController;
use App\Http\Controllers\Reference\TncController;
use App\Http\Controllers\StockCodeController;
use App\Http\Controllers\SupplierCategoryController;
use App\Http\Controllers\SupplierController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard')->name('home');

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
