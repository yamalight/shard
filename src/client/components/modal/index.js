import React from 'react';

const Modal = ({children, closeAction}) => (
    <div className="modal is-active">
        <div className="modal-background" />
        <div className="modal-container">
            <div className="modal-content">
                {children}
            </div>
        </div>
        <button className="modal-close" onClick={closeAction} />
    </div>
);

export default Modal;
