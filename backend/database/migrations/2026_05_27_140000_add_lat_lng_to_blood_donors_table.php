<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blood_donors', function (Blueprint $table) {
            if (!Schema::hasColumn('blood_donors', 'latitude')) {
                $table->decimal('latitude', 10, 8)->nullable()->after('donations_count');
            }
            if (!Schema::hasColumn('blood_donors', 'longitude')) {
                $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            }
        });
    }

    public function down(): void
    {
        Schema::table('blood_donors', function (Blueprint $table) {
            if (Schema::hasColumn('blood_donors', 'latitude')) {
                $table->dropColumn('latitude');
            }
            if (Schema::hasColumn('blood_donors', 'longitude')) {
                $table->dropColumn('longitude');
            }
        });
    }
};
