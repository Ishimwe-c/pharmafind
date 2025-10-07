<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    /**
     * Store a new contact message
     * This endpoint allows users to send contact messages through the contact form
     */
    public function store(Request $request)
    {
        // Validate the incoming request data
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
        ]);

        // Return validation errors if any
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Create the contact message with auto-determined priority
            $message = ContactMessage::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'subject' => $request->subject,
                'message' => $request->message,
                'status' => 'new',
                'priority' => $this->determinePriority($request->subject, $request->message)
            ]);

            // Return success response
            return response()->json([
                'success' => true,
                'message' => 'Your message has been sent successfully. We will get back to you soon!',
                'data' => $message
            ], 201);

        } catch (\Exception $e) {
            // Log error and return failure response
            \Log::error('Contact message creation failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Determine message priority based on content analysis
     * This helps admins prioritize urgent messages
     */
    private function determinePriority($subject, $message)
    {
        // Keywords that indicate urgent messages
        $urgentKeywords = ['urgent', 'emergency', 'critical', 'asap', 'immediately', 'broken', 'down'];
        
        // Keywords that indicate high priority messages
        $highKeywords = ['problem', 'issue', 'complaint', 'not working', 'error', 'bug', 'help'];
        
        // Combine subject and message for analysis
        $content = strtolower($subject . ' ' . $message);
        
        // Check for urgent keywords first
        foreach ($urgentKeywords as $keyword) {
            if (strpos($content, $keyword) !== false) {
                return 'urgent';
            }
        }
        
        // Check for high priority keywords
        foreach ($highKeywords as $keyword) {
            if (strpos($content, $keyword) !== false) {
                return 'high';
            }
        }
        
        // Default to medium priority
        return 'medium';
    }
}
