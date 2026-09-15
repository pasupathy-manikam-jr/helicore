<?php

namespace Tests\Feature;

use App\Models\StockSold;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    /**
     * One table per product line, all the same shape, none with a migration.
     */
    protected function setUp(): void
    {
        parent::setUp();

        foreach (StockSold::PRODUCTS as $meta) {
            Schema::create($meta['table'], function (Blueprint $table) {
                $table->increments('id');
                $table->string('stockcode')->nullable();
                $table->integer('year')->nullable();
                $table->string('invoice_do_date', 2000)->nullable();

                foreach (array_keys(StockSold::MONTHS) as $month) {
                    $table->integer($month)->nullable();
                }
            });
        }
    }

    private function actingAsReportUser(string ...$permissions): User
    {
        $user = User::factory()->create();

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $user->givePermissionTo($permissions);
        $this->actingAs($user);

        return $user;
    }

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get(route('report.stock-sold'))->assertRedirect(route('login'));
    }

    public function test_users_without_the_permission_are_forbidden()
    {
        $this->actingAsReportUser('quotation-list');

        $this->get(route('report.stock-sold'))->assertForbidden();
    }

    public function test_the_report_totals_the_year_and_lists_the_despatches()
    {
        $this->actingAsReportUser('salesorder-list');

        DB::table('rtj_stocksold')->insert([
            'stockcode' => 'RTJ-1',
            'year' => 2022,
            'jan' => 2,
            'feb' => 3,
            'decb' => 5,
            'invoice_do_date' => 'INV1 | DO1 | 01-01-2022,INV2 | DO2 | 02-02-2022',
        ]);

        $this->get(route('report.stock-sold'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('product', 'rtj')
                ->where('year', 2022)
                ->where('rows.0.stockcode', 'RTJ-1')
                // December lives in a column called decb.
                ->where('rows.0.total', 10)
                ->count('rows.0.despatches', 2)
            );
    }

    public function test_the_year_falls_back_to_the_most_recent_one_on_record()
    {
        $this->actingAsReportUser('salesorder-list');

        DB::table('spw_stocksold')->insert([
            ['stockcode' => 'SPW-OLD', 'year' => 2016, 'jan' => 1],
            ['stockcode' => 'SPW-NEW', 'year' => 2022, 'jan' => 1],
        ]);

        $this->get(route('report.stock-sold', ['product' => 'spw']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('year', 2022)
                ->count('rows', 1)
                ->where('rows.0.stockcode', 'SPW-NEW')
                ->where('years', [2022, 2016])
            );
    }

    public function test_a_product_line_with_no_figures_renders_empty()
    {
        $this->actingAsReportUser('salesorder-list');

        $this->get(route('report.stock-sold', ['product' => 'kz']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('year', null)->count('rows', 0));
    }

    public function test_an_unknown_product_is_rejected()
    {
        $this->actingAsReportUser('salesorder-list');

        $this->get(route('report.stock-sold', ['product' => 'nstd']))
            ->assertSessionHasErrors('product');
    }
}
