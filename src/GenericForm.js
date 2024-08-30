// src/GenericForm.js
import React from 'react';

const GenericForm = ({ currentData, setCurrentData, handleSubmit, message, fields, errors }) => {
    return (
        <div className="form-container">
            <form onSubmit={handleSubmit}>
                {fields.map((field) => (
                    <React.Fragment key={field.name}>
                        <label className="form-label" htmlFor={field.name}>{field.label}</label>
                        <input
                            className={`form-field ${errors[field.name] ? 'input-error' : ''}`}
                            type={field.type}
                            id={field.name}
                            name={field.name}
                            placeholder={field.placeholder}
                            value={currentData[field.name]}
                            onChange={(e) => setCurrentData({ ...currentData, [field.name]: e.target.value })}
                            required={field.required}
                        />
                        {errors[field.name] && <div className="error-message">{errors[field.name]}</div>}
                    </React.Fragment>
                ))}
                <button className="form-button" type="submit">{message.buttonText}</button>
            </form>
            {message.text && <div className="success-message">{message.text}</div>}
        </div>
    );
};

export default GenericForm;
