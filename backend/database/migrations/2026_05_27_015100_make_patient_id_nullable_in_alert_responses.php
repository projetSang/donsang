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
            // Drop foreign key first, then redefine as nullable
            try {
                $table->dropForeign(['patient_id']);
            } catch (\Exception $e) {
                // Foreign key may not exist
            }
            $table->unsignedBigInteger('patient_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('alert_responses', function (Blueprint $table) {
            $table->unsignedBigInteger('patient_id')->nullable(false)->change();
        });
    }
};
