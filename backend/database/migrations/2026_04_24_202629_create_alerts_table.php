<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hospital_id')->constrained('hospitals')->onDelete('cascade');
            $table->string('blood_type');
            $table->string('urgency_level');
            $table->string('status')->default('Active');
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('alerts');
    }
};
