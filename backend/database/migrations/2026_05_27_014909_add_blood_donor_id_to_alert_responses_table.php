<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alert_responses', function (Blueprint $table) {
            if (!Schema::hasColumn('alert_responses', 'blood_donor_id')) {
                $table->foreignId('blood_donor_id')->nullable()->after('alert_id')->constrained('blood_donors')->onDelete('cascade');
            }
        });
    }

    public function down(): void
    {
        Schema::table('alert_responses', function (Blueprint $table) {
            if (Schema::hasColumn('alert_responses', 'blood_donor_id')) {
                $table->dropForeign(['blood_donor_id']);
                $table->dropColumn('blood_donor_id');
            }
        });
    }
};
