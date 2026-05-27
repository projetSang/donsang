<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alert_responses', function (Blueprint $table) {
            // Add patient_id column if it doesn't exist
            if (!Schema::hasColumn('alert_responses', 'patient_id')) {
                $table->foreignId('patient_id')->nullable()->after('blood_donor_id')->constrained('patients')->onDelete('cascade');
            } else {
                // Drop foreign key first, then redefine as nullable
                try {
                    $table->dropForeign(['patient_id']);
                } catch (\Exception $e) {
                    // Foreign key may not exist
                }
                $table->unsignedBigInteger('patient_id')->nullable()->change();
            }
        });
    }

    public function down(): void
    {
        Schema::table('alert_responses', function (Blueprint $table) {
            if (Schema::hasColumn('alert_responses', 'patient_id')) {
                try {
                    $table->dropForeign(['patient_id']);
                } catch (\Exception $e) {
                    // Foreign key may not exist
                }
                $table->dropColumn('patient_id');
            }
        });
    }
};
