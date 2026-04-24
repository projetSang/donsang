<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('blood_donors', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('blood_type');
            $table->string('city');
            $table->string('phone');
            $table->date('last_donation_date')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('blood_donors');
    }
};
