<?php

namespace Tests\Feature;

use App\Models\Afe;
use App\Models\ReceivingNote;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class AfeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('afe', function (Blueprint $table) {
            $table->increments('id');
            $table->string('originator')->nullable();
            $table->string('potype', 10)->nullable();
            $table->string('supplier_category_id', 30)->nullable();
            $table->integer('forward_status')->nullable();
            $table->text('approval')->nullable();
            $table->date('final_approval_date')->nullable();
            $table->string('approvalstatus', 10)->nullable();
            $table->text('comments')->nullable();
            $table->integer('currency_id')->nullable();
            $table->text('attachment')->nullable();
            $table->integer('supplier_id')->nullable();
            $table->string('status', 12)->nullable();
            $table->string('reference', 1000)->nullable();
            $table->string('suppquoteno', 50)->nullable();
            $table->string('eta', 100)->nullable();
            $table->date('actarrival')->nullable();
            $table->string('salesorder')->nullable();
            $table->string('payment_terms')->nullable();
            $table->string('buyingfrom', 500)->nullable();
            $table->string('suppliersubcat', 200)->nullable();
            $table->string('terms', 300)->nullable();
            $table->timestamps();
        });

        Schema::create('afe_descs', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('afe_id')->nullable();
            $table->string('item', 10)->nullable();
            $table->integer('qty')->nullable();
            $table->string('product')->nullable();
            $table->string('stock_code', 100)->nullable();
            $table->text('description')->nullable();
            $table->decimal('unitvalue', 10, 2)->nullable();
            $table->decimal('total', 10, 2)->nullable();
            $table->decimal('totalmyr', 10, 2)->nullable();
            $table->string('gst', 3)->nullable();
            $table->timestamps();
        });

        Schema::create('supplier', function (Blueprint $table) {
            $table->increments('id');
            $table->string('supplier_name')->nullable();
            $table->string('address')->nullable();
            $table->string('contact')->nullable();
            $table->string('contactperson')->nullable();
            $table->timestamps();
        });

        Schema::create('currency', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name')->nullable();
            $table->decimal('myrrate', 10, 4)->nullable();
        });

        Schema::create('supplier_category', function (Blueprint $table) {
            $table->increments('id');
            $table->string('category')->nullable();
            $table->string('subcategory')->nullable();
        });

        Schema::create('afe_approval_flow', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('approver_id')->nullable();
            $table->double('approving_limit_start')->nullable();
            $table->double('approving_limit')->nullable();
            $table->integer('stage')->nullable();
            $table->integer('forwardStatus')->nullable();
            $table->timestamps();
        });

        Schema::create('receivenote', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('afe_id')->nullable();
            $table->string('supplierinvoice', 200)->nullable();
            $table->date('deliverydate')->nullable();
            $table->string('awb', 50)->nullable();
            $table->string('osc', 50)->nullable();
            $table->string('user', 30)->nullable();
            $table->date('preparedate')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        Schema::create('receive_note_descs', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('receivenote_id')->nullable();
            $table->integer('afe_descs_id')->nullable();
            $table->integer('afe_id')->nullable();
            $table->date('after_delivery_date')->nullable();
            $table->float('qty_delivered')->nullable();
            $table->string('product')->nullable();
            $table->string('stock_code')->nullable();
            $table->string('description', 500)->nullable();
            $table->integer('workorder_id')->nullable();
            $table->integer('company_details_id')->nullable();
            $table->string('remarks', 1000)->nullable();
        });
    }

    private function actingAsAfeUser(string ...$permissions): User
    {
        $user = User::factory()->create();

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $user->givePermissionTo($permissions);
        $this->actingAs($user);

        return $user;
    }

    private function makeAfe(array $attributes = []): Afe
    {
        $id = DB::table('afe')->insertGetId([
            'potype' => 'LPO',
            'created_at' => now(),
            ...$attributes,
        ]);

        return Afe::findOrFail($id);
    }

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get(route('afe.index'))->assertRedirect(route('login'));
    }

    public function test_the_listing_and_the_detail_have_their_own_permissions()
    {
        $this->actingAsAfeUser('afe-index');

        $this->get(route('afe.index'))->assertOk();
        $this->get(route('afe.show', $this->makeAfe()))->assertForbidden();
    }

    public function test_approvals_are_read_out_of_the_json_column_with_names()
    {
        $approver = User::factory()->create(['name' => 'Dana Manager']);
        $this->actingAsAfeUser('afe-show');

        $afe = $this->makeAfe([
            'approval' => json_encode([
                (string) $approver->id => ['id' => $approver->id, 'status' => 'yes', 'date' => '03-12-2023'],
            ]),
        ]);

        $approvals = $afe->approvals();

        $this->assertCount(1, $approvals);
        $this->assertSame('Dana Manager', $approvals[0]['name']);
        $this->assertSame('yes', $approvals[0]['status']);
        $this->assertTrue($afe->isApproved());
    }

    public function test_an_afe_is_only_approved_once_every_approver_has_said_yes()
    {
        $this->actingAsAfeUser('afe-show');

        $pending = $this->makeAfe([
            'approval' => json_encode([
                '16' => ['id' => 16, 'status' => 'yes', 'date' => '25-11-2023'],
                '27' => ['id' => 27, 'status' => 'no', 'date' => '25-11-2023'],
            ]),
        ]);

        $this->assertFalse($pending->isApproved());
        // An AFE nobody has been asked to approve is not approved either.
        $this->assertFalse($this->makeAfe(['approval' => ''])->isApproved());
    }

    public function test_a_malformed_approval_column_does_not_break_the_listing()
    {
        $this->actingAsAfeUser('afe-index');

        $this->makeAfe(['approval' => 'not json at all']);

        $this->get(route('afe.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('afes.0.approved', false));
    }

    public function test_the_delay_is_the_days_between_the_estimate_and_the_arrival()
    {
        $this->actingAsAfeUser('afe-index');

        $this->makeAfe(['eta' => '2023-01-01', 'actarrival' => '2023-01-08']);

        $this->get(route('afe.index'))
            ->assertInertia(fn ($page) => $page->where('afes.0.delay', 7));
    }

    public function test_the_detail_page_totals_the_lines()
    {
        $this->actingAsAfeUser('afe-show');

        $supplierId = DB::table('supplier')->insertGetId(['supplier_name' => 'Gasket Supplies']);
        $currencyId = DB::table('currency')->insertGetId(['name' => 'USD']);
        $afe = $this->makeAfe(['supplier_id' => $supplierId, 'currency_id' => $currencyId]);

        DB::table('afe_descs')->insert([
            ['afe_id' => $afe->id, 'item' => '1', 'qty' => 2, 'total' => 200, 'totalmyr' => 900],
            ['afe_id' => $afe->id, 'item' => '2', 'qty' => 3, 'total' => 300, 'totalmyr' => 1350],
        ]);

        $this->get(route('afe.show', $afe))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('afe.supplier.supplier_name', 'Gasket Supplies')
                ->where('afe.currency', 'USD')
                ->where('totals.quantity', 5)
                ->where('totals.subtotal', 500)
                ->where('totals.myr', 2250)
            );
    }

    public function test_an_afe_can_be_created()
    {
        $this->actingAsAfeUser('afe-create');

        $supplierId = DB::table('supplier')->insertGetId(['supplier_name' => 'Gasket Supplies']);
        $currencyId = DB::table('currency')->insertGetId(['name' => 'USD']);
        $categoryId = DB::table('supplier_category')->insertGetId([
            'category' => 'Materials', 'subcategory' => 'Sheet',
        ]);

        $this->post(route('afe.store'), [
            'potype' => 'LPO',
            'supplier_id' => $supplierId,
            'supplier_category_id' => (string) $categoryId,
            'suppquoteno' => 'SQ-1',
            'currency_id' => $currencyId,
            'originator' => 'Dana',
        ])->assertRedirect();

        $this->assertDatabaseHas('afe', [
            'suppquoteno' => 'SQ-1',
            'supplier_id' => $supplierId,
            'forward_status' => 0,
        ]);
    }

    public function test_creating_an_afe_needs_a_supplier_and_a_quote()
    {
        $this->actingAsAfeUser('afe-create');

        $this->post(route('afe.store'), [])->assertSessionHasErrors([
            'potype', 'supplier_id', 'supplier_category_id', 'suppquoteno',
            'currency_id', 'originator',
        ]);
    }

    public function test_editing_an_afe_needs_the_edit_permission()
    {
        $this->actingAsAfeUser('afe-create');

        $this->get(route('afe.edit', $this->makeAfe()))->assertForbidden();
    }

    public function test_the_approval_ladder_is_listed_by_stage()
    {
        $user = $this->actingAsAfeUser('afe-workflow-index');
        $next = User::factory()->create(['name' => 'Second Approver']);

        DB::table('afe_approval_flow')->insert([
            [
                'approver_id' => $user->id, 'approving_limit_start' => 0,
                'approving_limit' => 5000, 'stage' => 1, 'forwardStatus' => $next->id,
            ],
            [
                'approver_id' => $next->id, 'approving_limit_start' => 5000,
                'approving_limit' => 50000, 'stage' => 2, 'forwardStatus' => 0,
            ],
        ]);

        $this->get(route('afe-workflow.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('stages.0.stage', 1)
                ->where('stages.0.approver', $user->name)
                ->where('stages.0.forward_to', 'Second Approver')
                // Zero means the AFE stops with this approver.
                ->where('stages.1.forward_to', null)
            );
    }

    public function test_an_approval_stage_cannot_end_below_where_it_starts()
    {
        $user = $this->actingAsAfeUser('afe-workflow-create');

        $this->post(route('afe-workflow.store'), [
            'approver_id' => $user->id,
            'approving_limit_start' => 5000,
            'approving_limit' => 1000,
            'stage' => 1,
        ])->assertSessionHasErrors('approving_limit');
    }

    public function test_an_approval_stage_can_be_added()
    {
        $user = $this->actingAsAfeUser('afe-workflow-create');

        $this->post(route('afe-workflow.store'), [
            'approver_id' => $user->id,
            'approving_limit_start' => 0,
            'approving_limit' => 1000,
            'stage' => 1,
        ])->assertRedirect();

        $this->assertDatabaseHas('afe_approval_flow', [
            'approver_id' => $user->id,
            'approving_limit' => 1000,
            // Blank means the AFE stops here.
            'forwardStatus' => 0,
        ]);
    }

    public function test_a_receiving_note_lists_what_arrived_against_its_afe()
    {
        $this->actingAsAfeUser('receivenote-list', 'receivenote-show');

        $supplierId = DB::table('supplier')->insertGetId(['supplier_name' => 'Gasket Supplies']);
        $afe = $this->makeAfe(['supplier_id' => $supplierId]);

        $noteId = DB::table('receivenote')->insertGetId([
            'afe_id' => $afe->id,
            'supplierinvoice' => 'INV-7',
            'user' => 'Dana',
        ]);
        DB::table('receive_note_descs')->insert([
            'receivenote_id' => $noteId,
            'stock_code' => 'RTJ-1',
            'qty_delivered' => 4,
        ]);

        $this->get(route('receiving-note.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('notes.0.supplier', 'Gasket Supplies')
                ->where('notes.0.lines_count', 1)
            );

        $this->get(route('receiving-note.show', $noteId))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('note.supplierinvoice', 'INV-7')
                ->where('lines.0.stock_code', 'RTJ-1')
                ->where('lines.0.qty_delivered', 4)
            );
    }

    public function test_receiving_notes_have_their_own_permission()
    {
        $this->actingAsAfeUser('afe-index');

        $this->get(route('receiving-note.index'))->assertForbidden();
    }

    public function test_a_line_is_priced_in_the_afe_currency_and_in_ringgit()
    {
        $this->actingAsAfeUser('afe-edit');

        $currencyId = DB::table('currency')->insertGetId(['name' => 'USD', 'myrrate' => 4.5]);
        $afe = $this->makeAfe(['currency_id' => $currencyId]);

        $this->post(route('afe.line.store', $afe), [
            'description' => 'Sheet material',
            'stock_code' => 'SHT-1',
            'qty' => 3,
            'unitvalue' => 100,
        ])->assertRedirect()->assertSessionHasNoErrors();

        $line = $afe->lines()->first();

        $this->assertEqualsWithDelta(300, $line->total, 0.001);
        $this->assertEqualsWithDelta(1350, $line->totalmyr, 0.001);
        $this->assertSame('1', (string) $line->item);
    }

    public function test_a_line_cannot_be_touched_through_another_afe()
    {
        $this->actingAsAfeUser('afe-edit', 'afe-delete');

        $owner = $this->makeAfe();
        $other = $this->makeAfe();
        DB::table('afe_descs')->insert([
            'afe_id' => $owner->id, 'item' => '1', 'qty' => 1, 'unitvalue' => 1, 'total' => 1,
        ]);
        $line = $owner->lines()->first();

        $this->put(route('afe.line.update', [$other, $line]), [
            'description' => 'x', 'qty' => 1, 'unitvalue' => 1,
        ])->assertNotFound();
        $this->delete(route('afe.line.destroy', [$other, $line]))->assertNotFound();

        $this->assertDatabaseHas('afe_descs', ['id' => $line->id]);
    }

    public function test_an_approver_signs_as_themselves()
    {
        $approver = $this->actingAsAfeUser('afe-approve', 'afe-show');
        $afe = $this->makeAfe();

        $this->post(route('afe.approve', $afe), ['status' => 'yes'])
            ->assertRedirect();

        $approvals = $afe->fresh()->approvals();

        $this->assertCount(1, $approvals);
        $this->assertSame($approver->id, $approvals[0]['id']);
        $this->assertSame('yes', $approvals[0]['status']);
        $this->assertTrue($afe->fresh()->isApproved());
    }

    public function test_an_approval_replaces_only_that_approver_s_decision()
    {
        $first = User::factory()->create();
        $second = $this->actingAsAfeUser('afe-approve');

        $afe = $this->makeAfe([
            'approval' => json_encode([
                (string) $first->id => ['id' => $first->id, 'status' => 'yes', 'date' => '01-01-2024'],
            ]),
        ]);

        $this->post(route('afe.approve', $afe), ['status' => 'no'])->assertRedirect();

        $approvals = collect($afe->fresh()->approvals())->keyBy('id');

        $this->assertSame('yes', $approvals[$first->id]['status']);
        $this->assertSame('no', $approvals[$second->id]['status']);
        // One "no" is enough to leave the AFE unapproved.
        $this->assertFalse($afe->fresh()->isApproved());
    }

    public function test_an_unknown_decision_is_rejected()
    {
        $this->actingAsAfeUser('afe-approve');

        $this->post(route('afe.approve', $this->makeAfe()), ['status' => 'maybe'])
            ->assertSessionHasErrors('status');
    }

    public function test_approving_needs_the_approve_permission()
    {
        $this->actingAsAfeUser('afe-edit');

        $this->post(route('afe.approve', $this->makeAfe()), ['status' => 'yes'])
            ->assertForbidden();
    }

    public function test_the_receiving_form_shows_what_is_still_outstanding()
    {
        $this->actingAsAfeUser('receivenote-create');

        $afe = $this->makeAfe();
        $lineId = DB::table('afe_descs')->insertGetId([
            'afe_id' => $afe->id, 'item' => '1', 'qty' => 10,
            'stock_code' => 'SHT-1', 'unitvalue' => 5, 'total' => 50,
        ]);
        // An earlier note already took four of them.
        $earlier = DB::table('receivenote')->insertGetId(['afe_id' => $afe->id]);
        DB::table('receive_note_descs')->insert([
            'receivenote_id' => $earlier, 'afe_id' => $afe->id,
            'afe_descs_id' => $lineId, 'qty_delivered' => 4,
        ]);

        $this->get(route('receiving-note.create', $afe))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('lines.0.qty', 10)
                ->where('lines.0.already_received', 4)
            );
    }

    public function test_a_receiving_note_records_only_the_lines_with_a_quantity()
    {
        $user = $this->actingAsAfeUser('receivenote-create', 'receivenote-show');

        $afe = $this->makeAfe();
        $first = DB::table('afe_descs')->insertGetId([
            'afe_id' => $afe->id, 'item' => '1', 'qty' => 10, 'stock_code' => 'SHT-1',
        ]);
        $second = DB::table('afe_descs')->insertGetId([
            'afe_id' => $afe->id, 'item' => '2', 'qty' => 5, 'stock_code' => 'SHT-2',
        ]);

        $this->post(route('receiving-note.store'), [
            'afe_id' => $afe->id,
            'supplierinvoice' => 'INV-3',
            'quantities' => [$first => 4, $second => ''],
        ])->assertRedirect();

        $note = ReceivingNote::latest('id')->first();

        $this->assertSame('INV-3', $note->supplierinvoice);
        $this->assertSame((string) $user->id, (string) $note->user);
        $this->assertCount(1, $note->lines);
        $this->assertSame($first, $note->lines->first()->afe_descs_id);
        $this->assertEqualsWithDelta(4, $note->lines->first()->qty_delivered, 0.001);
        // The line carries the stock code across from the AFE.
        $this->assertSame('SHT-1', $note->lines->first()->stock_code);
    }

    public function test_a_receiving_note_with_no_quantities_is_refused()
    {
        $this->actingAsAfeUser('receivenote-create');

        $afe = $this->makeAfe();
        $lineId = DB::table('afe_descs')->insertGetId([
            'afe_id' => $afe->id, 'item' => '1', 'qty' => 10,
        ]);

        $this->post(route('receiving-note.store'), [
            'afe_id' => $afe->id,
            'quantities' => [$lineId => 0],
        ])->assertRedirect();

        $this->assertDatabaseCount('receivenote', 0);
    }

    public function test_receiving_needs_the_create_permission()
    {
        $this->actingAsAfeUser('receivenote-list');

        $this->get(route('receiving-note.create', $this->makeAfe()))
            ->assertForbidden();
    }
}
