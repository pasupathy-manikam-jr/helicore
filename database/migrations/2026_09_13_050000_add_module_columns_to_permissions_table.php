<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The legacy database carries `module` and `sequence` on the permissions
 * table; Spatie's own migration does not. The roles screen groups by module,
 * so a fresh install needs them too. Guarded, so it is a no-op where the
 * columns already exist.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('permissions', function (Blueprint $table) {
            if (! Schema::hasColumn('permissions', 'module')) {
                $table->string('module')->nullable()->index();
            }

            if (! Schema::hasColumn('permissions', 'sequence')) {
                $table->integer('sequence')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('permissions', function (Blueprint $table) {
            $table->dropColumn(['module', 'sequence']);
        });
    }
};
