<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hospital_id')->constrained('hospitals')->onDelete('cascade');
            $table->string('full_name');
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
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('patients');
    }
};
