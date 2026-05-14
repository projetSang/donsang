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
        Schema::table('patients', function (Blueprint $table) {
            if (!Schema::hasColumn('patients', 'allergies')) {
                $table->text('allergies')->nullable();
            }
            if (!Schema::hasColumn('patients', 'current_treatments')) {
                $table->text('current_treatments')->nullable();
            }
            if (!Schema::hasColumn('patients', 'medical_history')) {
                $table->text('medical_history')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn(['allergies', 'current_treatments', 'medical_history']);
        });
    }
};
