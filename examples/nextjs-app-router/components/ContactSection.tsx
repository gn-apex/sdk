// examples/nextjs-app-router/components/ContactSection.tsx
"use client";

import React from "react";
import {
  NexusContactForm,
  NexusContactName,
  NexusContactEmail,
  NexusContactPhone,
  NexusContactAddress,
  NexusContactMessage,
  NexusContactCustomField,
  NexusContactSubmit,
  NexusContactFeedback,
} from "@gnapex/sdk/react";

export function ContactSection() {
  return (
    <section className="py-16 px-4 max-w-xl mx-auto font-sans">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-white tracking-tight">
          Get in Touch
        </h2>
        <p className="text-sm text-gray-400 mt-2">
          Messages route directly to our team's sovereign omnichannel inbox.
        </p>
      </div>

      <NexusContactForm
        formId="website-inquiries"
        onSuccess={(res) => {
          console.log("Inquiry delivered:", res.message);
        }}
        className="space-y-4 p-8 rounded-3xl bg-neutral-900 border border-white/10 shadow-2xl"
      >
        <NexusContactName
          label="Your Name"
          placeholder="Juma Hamisi"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NexusContactEmail
            label="Email Address"
            placeholder="juma@example.com"
            required
          />
          <NexusContactPhone
            label="Phone Number"
            placeholder="+255 755 123 456"
            askWhatsapp
            whatsappLabel="WhatsApp active"
          />
        </div>

        <NexusContactCustomField
          fieldKey="organization"
          label="Organization / School"
          placeholder="Tanzania Media Foundation"
        />

        <NexusContactAddress
          label="Location"
          placeholder="Dar es Salaam, Tanzania"
        />

        <NexusContactMessage
          label="Inquiry / Message"
          placeholder="How can we collaborate with your team?"
          rows={4}
          required
        />

        <NexusContactFeedback />

        <NexusContactSubmit
          className="w-full bg-linear-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all cursor-pointer"
          loadingText="Transmitting to Edge..."
        >
          Send Inquiry
        </NexusContactSubmit>
      </NexusContactForm>
    </section>
  );
}
