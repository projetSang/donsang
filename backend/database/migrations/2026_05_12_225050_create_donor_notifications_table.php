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
        Schema::create('donor_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('blood_donor_id')->nullable()->constrained('blood_donors')->onDelete('cascade');
            $table->string('title');
            $table->text('message')->nullable();
            $table->string('type')->default('normal'); // urgent, normal
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donor_notifications');
    }
};
