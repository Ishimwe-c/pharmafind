<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Notification;
use App\Models\Purchase;
use App\Models\Pharmacy;
use App\Models\User;

class PurchaseNotification extends Notification
{
    // Removed ShouldQueue to send notifications immediately
    // use Queueable;

    protected $purchase;
    protected $type; // 'purchase_created', 'purchase_updated', 'purchase_cancelled'
    protected $pharmacy;
    protected $patient;

    /**
     * Create a new notification instance.
     */
    public function __construct(Purchase $purchase, string $type)
    {
        $this->purchase = $purchase;
        $this->type = $type;
        $this->pharmacy = $purchase->pharmacy;
        $this->patient = $purchase->user;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database']; // Only use database for now
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $subject = $this->getSubject();
        $greeting = $this->getGreeting($notifiable);
        $message = $this->getMessage();
        $actionText = $this->getActionText();
        $actionUrl = $this->getActionUrl();

        return (new MailMessage)
            ->subject($subject)
            ->greeting($greeting)
            ->line($message)
            ->line("Purchase Number: {$this->purchase->purchase_number}")
            ->line("Total Amount: RWF " . number_format($this->purchase->total_amount, 0))
            ->line("Payment Status: " . ucfirst(str_replace('_', ' ', $this->purchase->payment_status)))
            ->when($actionText && $actionUrl, function ($mail) use ($actionText, $actionUrl) {
                return $mail->action($actionText, $actionUrl);
            })
            ->line('Thank you for using PharmaFind!');
    }

    /**
     * Get the database representation of the notification.
     */
    public function toDatabase(object $notifiable): array
    {
        // Get purchase items with medicine details
        $items = $this->purchase->purchaseItems->map(function ($item) {
            return [
                'medicine_name' => $item->medicine->name ?? 'Unknown',
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'total_price' => $item->total_price,
            ];
        });

        return [
            'type' => $this->type,
            'purchase_id' => $this->purchase->id,
            'purchase_number' => $this->purchase->purchase_number,
            'pharmacy_id' => $this->pharmacy->id,
            'pharmacy_name' => $this->pharmacy->pharmacy_name,
            'pharmacy_location' => $this->pharmacy->location ?? null,
            'patient_id' => $this->patient->id,
            'patient_name' => $this->patient->name,
            'total_amount' => $this->purchase->total_amount,
            'insurance_coverage' => $this->purchase->insurance_coverage,
            'patient_payment' => $this->purchase->patient_payment,
            'payment_status' => $this->purchase->payment_status,
            'payment_method' => $this->purchase->payment_method,
            'insurance_name' => $this->purchase->insurance->name ?? null,
            'purchase_date' => $this->purchase->purchase_date->format('M d, Y g:i A'),
            'items_count' => $this->purchase->purchaseItems->count(),
            'items' => $items,
            'message' => $this->getMessage(),
            'action_url' => $this->getActionUrl(),
        ];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => $this->type,
            'purchase_id' => $this->purchase->id,
            'purchase_number' => $this->purchase->purchase_number,
            'pharmacy_id' => $this->pharmacy->id,
            'pharmacy_name' => $this->pharmacy->pharmacy_name,
            'patient_id' => $this->patient->id,
            'patient_name' => $this->patient->name,
            'total_amount' => $this->purchase->total_amount,
            'payment_status' => $this->purchase->payment_status,
            'message' => $this->getMessage(),
            'action_url' => $this->getActionUrl(),
        ];
    }

    /**
     * Get the notification subject based on type
     */
    private function getSubject(): string
    {
        switch ($this->type) {
            case 'purchase_created':
                return 'New Purchase Confirmation - PharmaFind';
            case 'purchase_updated':
                return 'Purchase Updated - PharmaFind';
            case 'purchase_cancelled':
                return 'Purchase Cancelled - PharmaFind';
            default:
                return 'Purchase Notification - PharmaFind';
        }
    }

    /**
     * Get the greeting based on notification type and recipient
     */
    private function getGreeting($notifiable): string
    {
        if ($this->type === 'purchase_created') {
            return "Hello {$notifiable->name}!";
        }
        return "Hello {$notifiable->name}!";
    }

    /**
     * Get the notification message based on type
     */
    private function getMessage(): string
    {
        switch ($this->type) {
            case 'purchase_created':
                return "Your purchase has been successfully created at {$this->pharmacy->pharmacy_name}. " .
                       "You can view the details and track your order status.";
            case 'purchase_updated':
                return "Your purchase at {$this->pharmacy->pharmacy_name} has been updated. " .
                       "Please check the new details.";
            case 'purchase_cancelled':
                return "Your purchase at {$this->pharmacy->pharmacy_name} has been cancelled. " .
                       "If you have any questions, please contact the pharmacy.";
            default:
                return "There has been an update to your purchase at {$this->pharmacy->pharmacy_name}.";
        }
    }

    /**
     * Get the action text based on type
     */
    private function getActionText(): ?string
    {
        switch ($this->type) {
            case 'purchase_created':
            case 'purchase_updated':
                return 'View Purchase Details';
            case 'purchase_cancelled':
                return 'Contact Pharmacy';
            default:
                return null;
        }
    }

    /**
     * Get the action URL based on type
     */
    private function getActionUrl(): ?string
    {
        switch ($this->type) {
            case 'purchase_created':
            case 'purchase_updated':
                return url('/patient/purchases/' . $this->purchase->id);
            case 'purchase_cancelled':
                return url('/pharmacy/' . $this->pharmacy->id . '/contact');
            default:
                return null;
        }
    }
}

