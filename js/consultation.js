function initConsultation() {
    // 1. Modal Elements
    const modal = document.getElementById('consultation-modal');
    if (!modal) return;
    
    const form = document.getElementById('consultation-form');
    const header = document.getElementById('consult-form-header');
    const successView = document.getElementById('consult-success-view');
    const submitBtn = document.getElementById('consult-submit-btn');
    const closeBtn = document.querySelector('.modal-close'); // Use class if ID is missing
    const closeSuccessBtn = document.getElementById('close-success-btn');

    // 2. Form Fields
    const destInput = document.getElementById('modal-destination');
    const svcInput = document.getElementById('modal-service');
    
    // Hidden fields for data tracking (UTM & Page)
    const pageInput = document.getElementById('modal-page');
    const utmSourceInput = document.getElementById('consult-utm-source');
    const utmMediumInput = document.getElementById('consult-utm-medium');
    const utmCampaignInput = document.getElementById('consult-utm-campaign');

    // 3. Smart Data Capture (UTM + Page URL)
    function getLeadInfo() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            utm_source: urlParams.get('utm_source') || '',
            utm_medium: urlParams.get('utm_medium') || '',
            utm_campaign: urlParams.get('utm_campaign') || '',
            page: window.location.href.split('?')[0] // Base URL
        };
    }

    // 4. Handle Modal Opening
    function openConsultationModal(destText, svcText) {
        // Auto-fill hidden fields
        const leadInfo = getLeadInfo();
        pageInput.value = leadInfo.page;
        utmSourceInput.value = leadInfo.utm_source;
        utmMediumInput.value = leadInfo.utm_medium;
        utmCampaignInput.value = leadInfo.utm_campaign;

        // Auto-fill and configure Destination & Service fields based on what was passed
        destInput.value = destText || '';
        svcInput.value = svcText || '';

        // Only lock the fields if they came pre-filled from the trigger
        if (!destText) {
            destInput.removeAttribute('readonly');
            destInput.style.background = '#fff';
            destInput.placeholder = 'Enter Destination';
        } else {
            destInput.setAttribute('readonly', 'readonly');
            destInput.style.background = '#f1f5f9';
        }

        if (!svcText) {
            svcInput.removeAttribute('readonly');
            svcInput.style.background = '#fff';
            svcInput.placeholder = 'Enter Service type';
        } else {
            svcInput.setAttribute('readonly', 'readonly');
            svcInput.style.background = '#f1f5f9';
        }

        // Show form & hide success
        if (form) form.style.display = 'block';
        if (header) header.style.display = 'block';
        if (successView) successView.style.display = 'none';

        // Display modal
        modal.style.display = 'flex'; // Override potentially hidden CSS
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Focus first input for UX smoothly
        setTimeout(() => {
            const nameInput = document.getElementById('consult-name');
            if (nameInput) nameInput.focus();
        }, 150);
    }

    // 5. Handle Modal Closing
    window.closeConsultationModal = function() {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = ''; // Reverts to CSS default (none)
        document.body.style.overflow = '';
        form.reset();
    }

    // Expose openConsultationModal to window
    window.openConsultationModal = openConsultationModal;

    if (closeBtn) closeBtn.addEventListener('click', window.closeConsultationModal);
    if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', window.closeConsultationModal);

    // Prevent duplicate event listeners and setup outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeConsultationModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeConsultationModal();
        }
    });

    // 6. Hook up the triggers (Hero Button, Mobile sticky CTA, external buttons)
    // We bind it directly to the document to handle any dynamically loaded elements or spans inside the button
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.consult-trigger');
        if (!trigger) return;

        e.preventDefault();

        let destText = '';
        let svcText = '';

        // If the trigger is the main hero button, grab select values
        if (trigger.id === 'hero-submit-btn') {
            const destSelect = document.getElementById('hero-dest-select');
            const svcSelect = document.getElementById('hero-svc-select');

            if (!destSelect.value || !svcSelect.value) {
                alert('Please select both a Destination and a Service Type before proceeding.');
                return; // Prevent opening
            }

            destText = destSelect.options[destSelect.selectedIndex].text;
            svcText = svcSelect.options[svcSelect.selectedIndex].text;
        } else {
            // Otherwise check if data attributes exist
            destText = trigger.getAttribute('data-destination') || '';
            svcText = trigger.getAttribute('data-service') || '';
        }

        openConsultationModal(destText, svcText);
    });

    // 7. Handle Google Sheets Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Native validation check
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const originalBtnText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerText = 'Submitting... ⏳';

        // Collect Form Data safely
        const formData = {
            name: document.getElementById('consult-name')?.value || '',
            email: document.getElementById('consult-email')?.value || '',
            phone: document.getElementById('consult-phone')?.value || '',
            city: document.getElementById('consult-city')?.value || '',
            destination: destInput?.value || '',
            service: svcInput?.value || '',
            message: document.getElementById('consult-msg')?.value || '',
            page: window.location.href, // Simplified page capture
            utm_source: utmSourceInput ? utmSourceInput.value : '',
            utm_medium: utmMediumInput ? utmMediumInput.value : '',
            utm_campaign: utmCampaignInput ? utmCampaignInput.value : ''
        };

        const MASTER_URL = 'https://script.google.com/macros/s/AKfycbzcPwNsL8XW0qWpWVsipIIN75pVp1ZzVnxh_xepIR2osT9HjJbThC2ztNzocw7kaJw/exec';
        const typeField = document.getElementById('modal-type');
        const SCRIPT_URL = MASTER_URL;

        // Start the background request
        fetch(SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        }).catch(err => console.error("Background submission failed:", err));

        // OPTIMISTIC UI: Show success after a tiny professional delay (800ms)
        // This makes the form feel instant for the user.
        setTimeout(() => {
            // Show Success State
            form.style.display = 'none';
            header.style.display = 'none';
            successView.style.display = 'block';

            // Auto Close after 2.5 seconds
            setTimeout(() => {
                closeConsultationModal();
                // Reset button state for next time
                submitBtn.disabled = false;
                submitBtn.innerText = originalBtnText;
            }, 2500);
        }, 800);
    });

    // 8. Handle "Travel Booking" vs "Visa Consultant" tab switch
    const tabs = document.querySelectorAll('.search-tab');
    if (tabs.length >= 2) {
        const visaTab = tabs[0];
        const ticketTab = tabs[1];
        
        const destSelect = document.getElementById('hero-dest-select');
        const svcSelect = document.getElementById('hero-svc-select');
        const submitBtnText = document.getElementById('hero-btn-text');

        const visaDestOptions = [
            { val: "", text: "Canada, UK, UAE...", disabled: true, selected: true },
            { val: "canada", text: "Canada" },
            { val: "uk", text: "United Kingdom" },
            { val: "uae", text: "UAE / Dubai" },
            { val: "aus", text: "Australia" },
            { val: "schengen", text: "Schengen Europe" }
        ];

        const visaSvcOptions = [
            { val: "", text: "Tourist, PR, Study...", disabled: true, selected: true },
            { val: "tourist", text: "Tourist Visa" },
            { val: "pr", text: "PR Consultation" },
            { val: "study", text: "Study Visa" },
            { val: "work", text: "Work Permit" }
        ];

        const travelDestOptions = [
            { val: "", text: "City of Arrival...", disabled: true, selected: true },
            { val: "dubai", text: "Dubai, UAE" },
            { val: "thailand", text: "Thailand" },
            { val: "maldives", text: "Maldives" },
            { val: "bali", text: "Bali, Indonesia" },
            { val: "london", text: "London, UK" },
            { val: "paris", text: "Paris, France" }
        ];

        const travelSvcOptions = [
            { val: "", text: "Flight, Hotel...", disabled: true, selected: true },
            { val: "flight", text: "Flight Only" },
            { val: "hotel", text: "Hotel Booking" },
            { val: "package", text: "Flight + Hotel" },
            { val: "tour", text: "Custom Tour Package" }
        ];

        function updateOptions(select, options) {
            if (!select) return;
            select.innerHTML = '';
            options.forEach(opt => {
                const o = document.createElement('option');
                o.value = opt.val;
                o.text = opt.text;
                if (opt.disabled) o.disabled = true;
                if (opt.selected) o.selected = true;
                select.appendChild(o);
            });
        }

        visaTab.addEventListener('click', (e) => {
            e.preventDefault();
            visaTab.classList.add('active');
            ticketTab.classList.remove('active');
            
            updateOptions(destSelect, visaDestOptions);
            updateOptions(svcSelect, visaSvcOptions);
            if (submitBtnText) submitBtnText.innerText = 'Get Consultation';
        });

        ticketTab.addEventListener('click', (e) => {
            e.preventDefault();
            ticketTab.classList.add('active');
            visaTab.classList.remove('active');
            
            updateOptions(destSelect, travelDestOptions);
            updateOptions(svcSelect, travelSvcOptions);
            if (submitBtnText) submitBtnText.innerText = 'Plan My Trip';
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConsultation);
} else {
    initConsultation();
}
