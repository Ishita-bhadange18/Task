
        let draggedElement = null;
        let currentElement = null;
        let elementCounter = 0;

        // Drag and drop functionality
        document.querySelectorAll('.element-item').forEach(item => {
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragend', handleDragEnd);
        });

        const canvas = document.getElementById('canvas');
        canvas.addEventListener('dragover', handleDragOver);
        canvas.addEventListener('drop', handleDrop);
        canvas.addEventListener('dragleave', handleDragLeave);

        function handleDragStart(e) {
            draggedElement = e.target;
            e.target.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('text/html', e.target.outerHTML);
        }

        function handleDragEnd(e) {
            e.target.classList.remove('dragging');
        }

        function handleDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            canvas.classList.add('drag-over');
        }

        function handleDragLeave(e) {
            canvas.classList.remove('drag-over');
        }

        function handleDrop(e) {
            e.preventDefault();
            canvas.classList.remove('drag-over');
            
            if (draggedElement) {
                const elementType = draggedElement.getAttribute('data-type');
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                createElementOnCanvas(elementType, x, y);
                draggedElement = null;
            }
        }

        function createElementOnCanvas(type, x, y) {
            elementCounter++;
            const elementId = `element_${elementCounter}`;
            
            const element = document.createElement('div');
            element.className = 'dropped-element';
            element.id = elementId;
            element.style.left = x + 'px';
            element.style.top = y + 'px';
            element.dataset.type = type;
            
            // Make element draggable within canvas
            element.draggable = true;
            element.addEventListener('dragstart', handleElementDragStart);
            element.addEventListener('dragend', handleElementDragEnd);
            element.addEventListener('click', () => selectElement(element));
            
            // Create default content based on type
            switch(type) {
                case 'paragraph':
                    element.innerHTML = '<p class="dropped-paragraph">Sample text paragraph</p>';
                    break;
                case 'image':
                    element.innerHTML = '<img class="dropped-image" src="https://via.placeholder.com/200x150" alt="Sample Image" style="width: 200px; height: 150px;">';
                    break;
                case 'button':
                    element.innerHTML = '<button class="dropped-button" style="background: #3498db; color: white;">Click Me</button>';
                    break;
            }
            
            canvas.appendChild(element);
            selectElement(element);
            openModal(element);
        }

        function handleElementDragStart(e) {
            e.stopPropagation();
            currentElement = e.target;
            e.dataTransfer.effectAllowed = 'move';
        }

        function handleElementDragEnd(e) {
            if (currentElement) {
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
                    currentElement.style.left = x + 'px';
                    currentElement.style.top = y + 'px';
                }
                currentElement = null;
            }
        }

        function selectElement(element) {
            document.querySelectorAll('.dropped-element').forEach(el => {
                el.classList.remove('selected');
            });
            element.classList.add('selected');
        }

        function openModal(element) {
            const modal = document.getElementById('modal');
            const modalTitle = document.getElementById('modal-title');
            const modalForm = document.getElementById('modal-form');
            
            currentElement = element;
            const type = element.dataset.type;
            
            modalTitle.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} Properties`;
            modalForm.innerHTML = getFormHTML(type, element);
            
            modal.style.display = 'block';
        }

        function getFormHTML(type, element) {
            switch(type) {
                case 'paragraph':
                    const pElement = element.querySelector('p');
                    const computedStyle = window.getComputedStyle(pElement);
                    return `
                        <div class="form-group">
                            <label>Text:</label>
                            <input type="text" id="text" value="${pElement.textContent}">
                        </div>
                        <div class="form-group">
                            <label>Font Size (px):</label>
                            <input type="number" id="fontSize" value="${parseInt(computedStyle.fontSize) || 16}" min="8" max="72">
                        </div>
                        <div class="form-group">
                            <label>Color:</label>
                            <input type="color" id="color" value="${rgbToHex(computedStyle.color) || '#000000'}">
                        </div>
                    `;
                    
                case 'image':
                    const imgElement = element.querySelector('img');
                    return `
                        <div class="form-group">
                            <label>Image URL:</label>
                            <input type="url" id="imageUrl" value="${imgElement.src}">
                        </div>
                        <div class="form-group">
                            <label>Width (px):</label>
                            <input type="number" id="width" value="${parseInt(imgElement.style.width) || 200}" min="50" max="800">
                        </div>
                        <div class="form-group">
                            <label>Height (px):</label>
                            <input type="number" id="height" value="${parseInt(imgElement.style.height) || 150}" min="50" max="600">
                        </div>
                    `;
                    
                case 'button':
                    const btnElement = element.querySelector('button');
                    const btnStyle = window.getComputedStyle(btnElement);
                    return `
                        <div class="form-group">
                            <label>Button Text:</label>
                            <input type="text" id="buttonText" value="${btnElement.textContent}">
                        </div>
                        <div class="form-group">
                            <label>Background Color:</label>
                            <input type="color" id="backgroundColor" value="${rgbToHex(btnStyle.backgroundColor) || '#3498db'}">
                        </div>
                        <div class="form-group">
                            <label>Text Color:</label>
                            <input type="color" id="textColor" value="${rgbToHex(btnStyle.color) || '#ffffff'}">
                        </div>
                        <div class="form-group">
                            <label>Alert Message:</label>
                            <input type="text" id="alertMessage" value="${btnElement.dataset.alertMessage || 'Button clicked!'}">
                        </div>
                    `;
            }
        }

        function saveElement() {
            if (!currentElement) return;
            
            const type = currentElement.dataset.type;
            
            switch(type) {
                case 'paragraph':
                    const pElement = currentElement.querySelector('p');
                    const text = document.getElementById('text').value;
                    const fontSize = document.getElementById('fontSize').value;
                    const color = document.getElementById('color').value;
                    
                    pElement.textContent = text;
                    pElement.style.fontSize = fontSize + 'px';
                    pElement.style.color = color;
                    break;
                    
                case 'image':
                    const imgElement = currentElement.querySelector('img');
                    const imageUrl = document.getElementById('imageUrl').value;
                    const width = document.getElementById('width').value;
                    const height = document.getElementById('height').value;
                    
                    imgElement.src = imageUrl;
                    imgElement.style.width = width + 'px';
                    imgElement.style.height = height + 'px';
                    break;
                    
                case 'button':
                    const btnElement = currentElement.querySelector('button');
                    const buttonText = document.getElementById('buttonText').value;
                    const backgroundColor = document.getElementById('backgroundColor').value;
                    const textColor = document.getElementById('textColor').value;
                    const alertMessage = document.getElementById('alertMessage').value;
                    
                    btnElement.textContent = buttonText;
                    btnElement.style.backgroundColor = backgroundColor;
                    btnElement.style.color = textColor;
                    btnElement.dataset.alertMessage = alertMessage;
                    
                    // Add click event listener
                    btnElement.onclick = function() {
                        alert(alertMessage);
                    };
                    break;
            }
            
            closeModal();
        }

        function closeModal() {
            document.getElementById('modal').style.display = 'none';
            currentElement = null;
        }

        function rgbToHex(rgb) {
            if (!rgb || rgb === 'rgb(0, 0, 0)') return '#000000';
            const result = rgb.match(/\d+/g);
            if (!result) return '#000000';
            return "#" + ((1 << 24) + (parseInt(result[0]) << 16) + (parseInt(result[1]) << 8) + parseInt(result[2])).toString(16).slice(1);
        }

        // Close modal when clicking outside
        window.onclick = function(event) {
            const modal = document.getElementById('modal');
            if (event.target === modal) {
                closeModal();
            }
        }
    