<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Purchase;
use App\Models\User;

class PurchaseConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $purchase;
    public $user;
    public $type;

    /**
     * Create a new message instance.
     */
    public function __construct(Purchase $purchase, User $user, string $type = 'purchase_created')
    {
        $this->purchase = $purchase;
        $this->user = $user;
        $this->type = $type;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->getSubject();
        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.purchase-confirmation',
            with: [
                'purchase' => $this->purchase,
                'user' => $this->user,
                'type' => $this->type,
                'pharmacy' => $this->purchase->pharmacy,
                'purchaseUrl' => config('app.frontend_url', 'http://localhost:5173') . '/patient/purchases/' . $this->purchase->id,
                'pharmacyUrl' => config('app.frontend_url', 'http://localhost:5173') . '/pharmacy/' . $this->purchase->pharmacy_id
            ]
        );
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->to($this->user->email, $this->user->name);
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

    /**
     * Get the notification subject based on type
     */
    private function getSubject(): string
    {
        switch ($this->type) {
            case 'purchase_created':
                return '✅ Purchase Confirmation - PharmaFind';
            case 'purchase_updated':
                return '📝 Purchase Updated - PharmaFind';
            case 'purchase_cancelled':
                return '❌ Purchase Cancelled - PharmaFind';
            default:
                return '📋 Purchase Notification - PharmaFind';
        }
    }
}
