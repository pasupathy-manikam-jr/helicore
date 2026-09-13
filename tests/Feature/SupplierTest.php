<?php

namespace Tests\Feature;

use App\Http\Requests\SupplierRequest;
use App\Models\Supplier;
use Tests\TestCase;

class SupplierTest extends TestCase
{
    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get(route('supplier.index'))->assertRedirect(route('login'));
    }

    public function test_legacy_comma_separated_categories_are_exposed_as_ints()
    {
        $supplier = new Supplier(['supplier_category_id' => '3,7, 11,']);

        $this->assertSame([3, 7, 11], $supplier->categoryIds());
    }

    public function test_no_categories_yields_an_empty_list()
    {
        $this->assertSame([], (new Supplier(['supplier_category_id' => '']))->categoryIds());
    }

    public function test_submitted_categories_are_written_back_as_a_comma_string()
    {
        $request = SupplierRequest::create('/supplier', 'POST', [
            'supplier_name' => 'Acme',
            'supplier_category_id' => [3, 7, 11],
            'approver' => 1,
            'regno' => 'R-1',
            'address' => '1 Example Way',
            'contact' => '0123',
            'contactperson' => 'Sam',
        ]);

        $request->setContainer($this->app)->setRedirector($this->app['redirect']);
        $request->setValidator($this->app['validator']->make(
            $request->all(),
            ['supplier_category_id' => ['required', 'array']],
        ));

        $this->assertSame('3,7,11', $request->supplierAttributes()['supplier_category_id']);
    }
}
