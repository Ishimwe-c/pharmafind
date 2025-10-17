<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Pharmacy;
use App\Models\Insurance;

class InsuranceMatchMail extends Mailable
{
    use Queueable, SerializesModels;

    public $pharmacy;
    public $insurance;
    public $distance;
    public $user;

    /**
     * Create a new message instance.
     */
    public function __construct($pharmacy, $insurance, $distance, $user)
    {
        $this->pharmacy = $pharmacy;
        $this->insurance = $insurance;
        $this->distance = $distance;
        $this->user = $user;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🏥 Pharmacy Found - Your Insurance is Accepted!',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.insurance-match',
            with: [
                'pharmacy' => $this->pharmacy,
                'insurance' => $this->insurance,
                'distance' => $this->distance,
                'user' => $this->user,
                'pharmacyUrl' => config('app.frontend_url', 'http://localhost:5173') . '/pharmacy/' . $this->pharmacy->id
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
