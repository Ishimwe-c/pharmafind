<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Notification;
use App\Models\Pharmacy;
use App\Models\Insurance;

class InsuranceMatchAlert extends Notification implements ShouldQueue
{
    use Queueable;

    protected $pharmacy;
    protected $insurance;
    protected $distance;

    /**
     * Create a new notification instance.
     */
    public function __construct(Pharmacy $pharmacy, Insurance $insurance, $distance = null)
    {
        $this->pharmacy = $pharmacy;
        $this->insurance = $insurance;
        $this->distance = $distance;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $distanceText = $this->distance ? " (approximately {$this->distance} km away)" : "";
        
        return (new MailMessage)
            ->subject('Insurance Match Alert - Pharmacy Nearby')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line("Great news! We found a pharmacy that accepts your {$this->insurance->name} insurance{$distanceText}.")
            ->line("Pharmacy: {$this->pharmacy->pharmacy_name}")
            ->line("Location: {$this->pharmacy->location}")
            ->line("You can purchase your medicines here with your insurance coverage.")
            ->action('View Pharmacy Details', url('/pharmacy/' . $this->pharmacy->id))
            ->line('Thank you for using PharmaFind!');
    }

    /**
     * Get the database representation of the notification.
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'insurance_match_alert',
            'pharmacy_id' => $this->pharmacy->id,
            'pharmacy_name' => $this->pharmacy->pharmacy_name,
            'pharmacy_location' => $this->pharmacy->location,
            'insurance_id' => $this->insurance->id,
            'insurance_name' => $this->insurance->name,
            'distance' => $this->distance,
            'message' => "Pharmacy '{$this->pharmacy->pharmacy_name}' accepts your {$this->insurance->name} insurance" . 
                        ($this->distance ? " (approximately {$this->distance} km away)" : ""),
            'action_url' => '/pharmacy/' . $this->pharmacy->id,
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
            'type' => 'insurance_match_alert',
            'pharmacy_id' => $this->pharmacy->id,
            'pharmacy_name' => $this->pharmacy->pharmacy_name,
            'pharmacy_location' => $this->pharmacy->location,
            'insurance_id' => $this->insurance->id,
            'insurance_name' => $this->insurance->name,
            'distance' => $this->distance,
            'message' => "Pharmacy '{$this->pharmacy->pharmacy_name}' accepts your {$this->insurance->name} insurance" . 
                        ($this->distance ? " (approximately {$this->distance} km away)" : ""),
            'action_url' => '/pharmacy/' . $this->pharmacy->id,
        ];
    }
}
