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
        Schema::create('alert_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alert_id')->constrained('alerts')->onDelete('cascade');
            $table->foreignId('blood_donor_id')->nullable()->constrained('blood_donors')->onDelete('cascade');
            $table->string('status'); // available, unavailable
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alert_responses');
    }
};
