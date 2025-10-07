import React from 'react'
import { Link } from 'react-router-dom' 


export default function Footer() {
  return (
    <div>
        <footer className="text-center py-4 text-xs text-gray-500">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; {new Date().getFullYear()} PharmaFind. All rights reserved.</p>

        </div>
      </footer>
    </div>
  )
}
