<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('blood_donors', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('cin')->nullable()->unique();
            $table->string('email')->nullable();
            $table->string('password')->nullable();
            $table->string('blood_type');
            $table->string('city');
            $table->string('phone');
            $table->date('last_donation_date')->nullable();
            $table->integer('donations_count')->default(0);
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('blood_donors');
    }
};
