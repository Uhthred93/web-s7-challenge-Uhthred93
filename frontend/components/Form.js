import React, { useState } from 'react';
import * as yup from 'yup';
import axios from 'axios';

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'Full name must be at least 3 characters',
  fullNameTooLong: 'Full name must be at most 20 characters',
  sizeIncorrect: 'Size must be S or M or L'
};

const formSchema = yup.object().shape({
  fullName: yup.string().trim().min(3, validationErrors.fullNameTooShort).max(20, validationErrors.fullNameTooLong).required(),
  size: yup.string().oneOf(['S', 'M', 'L'], validationErrors.sizeIncorrect).required(),
  toppings: yup.array().of(yup.string())
});
// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
];

export default function Form() {
  const [formData, setFormData] = useState({ fullName: '', size: '', toppings: [] });
  const [errors, setErrors] = useState({});
  const [responseMessage, setResponseMessage] = useState('');

  const validate = (name, value) => {
    yup.reach(formSchema, name).validate(value)
      .then(() => setErrors(prev => ({ ...prev, [name]: ''})))
      .catch(err => setErrors(prev => ({ ...prev, [name]: err.errors[0] })));
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    const toValidateValue = type === 'checkbox' ? formData.topping : value;

    if (type === 'checkbox') {
      const newToppings = checked
          ? [...formData.toppings, value]
          : formData.toppings.filter(topping => topping !== value);

      setFormData(prev => ({ ...prev, toppings: newToppings }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    validate(name, toValidateValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:9009/api/order', formData);
      setResponseMessage(response.data.message);
      setFormData({ fullName: '', size: '', toppings: [] });
    } catch (error) {
      console.error('Submission error', error);
      setResponseMessage('Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Order Your Pizza</h2>
      {responseMessage && <div className={responseMessage.includes('wrong') ? 'failure' : 'success'}>{responseMessage}</div>}

      <div className="input-group">
        <label htmlFor="fullName">Full Name</label><br />
        <input
          id="fullName"
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
        />
        {errors.fullName && <div className='error'>{errors.fullName}</div>}
      </div>

      <div className="input-group">
        <label htmlFor="size">Size</label><br />
        <select id="size" name="size" value={formData.size} onChange={handleChange}>
          <option value="">----Choose Size----</option>
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
        </select>
        {errors.size && <div className='error'>{errors.size}</div>}
      </div>

      <div className="input-group">
        {toppings.map(topping => (
          <label key={topping.topping_id}>
            <input
            name="toppings"
            type="checkbox"
            value={topping.topping_id}
            checked={formData.toppings.includes(topping.topping_id)}
            onChange={handleChange}
            />
            {topping.text}<br />
          </label>
        ))}
      </div>
      <input type="submit" 
      disabled={Object.keys(errors).some(key => errors[key] !== '') || !formData.fullName || !formData.size}
      />
    </form>
  );
}
