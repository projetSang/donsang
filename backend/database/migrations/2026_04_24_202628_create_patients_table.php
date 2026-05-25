<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hospital_id')->nullable()->constrained('hospitals')->onDelete('cascade');
            $table->string('full_name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('cin')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('height')->nullable();
            $table->string('weight')->nullable();
            $table->json('chronic_diseases')->nullable();
            $table->string('blood_type');
            $table->string('status')->default('En attente');
            $table->date('admission_date');
            $table->text('allergies')->nullable();
            $table->text('current_treatments')->nullable();
            $table->text('medical_history')->nullable();
            $table->string('share_token')->nullable()->unique();
            $table->timestamp('share_token_expires_at')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_relation')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->integer('donations_count')->default(0);
            $table->date('last_donation_date')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('patients');
    }
};
