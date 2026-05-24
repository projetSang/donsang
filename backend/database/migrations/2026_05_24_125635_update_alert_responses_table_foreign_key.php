<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('alert_responses', function (Blueprint $table) {
            $table->dropForeign(['patient_id']);
            $table->dropColumn('patient_id');
            $table->unsignedBigInteger('blood_donor_id')->nullable()->after('alert_id');
            $table->foreign('blood_donor_id')->references('id')->on('blood_donors')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('alert_responses', function (Blueprint $table) {
            $table->dropForeign(['blood_donor_id']);
            $table->dropColumn('blood_donor_id');
            $table->unsignedBigInteger('patient_id')->nullable()->after('alert_id');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
        });
    }
};
