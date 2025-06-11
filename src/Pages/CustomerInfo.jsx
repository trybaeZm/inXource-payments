import Swal from 'sweetalert2';
import React, { useState } from 'react';
import PaymentService from '../api/payment';
import { useLocation, useParams, useNavigate  } from 'react-router-dom';

const CustomerInfoForm = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    location: '',
    phone: location.state?.phone,
    business_id: location.state?.id
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    formData.name = formData.firstName + ' ' + formData.lastName;
    
    try {
      const response = await PaymentService.addCustomer(formData);
      const res = response[0];

      if (res) {
        navigation('/payment/product', { state: { res } })
      } 
    } catch (error) {
      Swal.fire('error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div style={styles.body}>
      <div style={styles.formContainer}>
        <h2 style={styles.heading}>Customer Details</h2>
        <p style={styles.note}>
          Hi there! Since it’s your first time, we just need a few quick details to get to know you better.
          Don’t worry—this is a one-time request, and we won’t ask again.
        </p>
        <form onSubmit={handleSubmit}>
          <label style={styles.label} htmlFor="firstName">First Name</label>
          <input
            style={styles.input}
            type="text"
            id="firstName"
            name="firstName"
            placeholder="Enter first name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />

          <label style={styles.label} htmlFor="lastName">Last Name</label>
          <input
            style={styles.input}
            type="text"
            id="lastName"
            name="lastName"
            placeholder="Enter last name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />

          <label style={styles.label} htmlFor="email">Email</label>
          <input
            style={styles.input}
            type="email"
            id="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label style={styles.label} htmlFor="gender">Gender</label>
          <select
            style={styles.input}
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Gender --</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>

          <label style={styles.label} htmlFor="location">Town or Province</label>
          <select
            style={styles.input}
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Your Town or Province --</option>
            {zambianTowns.map((town, index) => (
              <option key={index} value={town}>{town}</option>
            ))}
          </select>

          <button type="submit" style={styles.button} disabled={loading}>{loading ? 'loading' : "Proceed to Payment"}</button>
        </form>
      </div>
    </div>
  );
};

const zambianTowns = [
  "Lusaka", "Ndola", "Kitwe", "Livingstone", "Chipata", "Chingola", "Mansa",
  "Kabwe", "Kasama", "Solwezi", "Mongu", "Mazabuka", "Kafue", "Luanshya",
  "Kalulushi", "Kapiri Mposhi", "Choma", "Siavonga", "Mpika", "Petauke",
  "Katete", "Isoka", "Nakonde", "Mumbwa", "Serenje", "Samfya", "Monze",
  "Lundazi", "Chililabombwe", "Namwala", "Zimba", "Mbala", "Chadiza", "Kaoma",
  "Itezhi-Tezhi", "Maamba", "Senanga", "Chavuma", "Nchelenge", "Kawambwa",
  "Kalabo", "Mpongwe", "Lukulu", "Chama", "Nyimba", "Mwense", "Chilubi",
  "Milenge", "Chembe", "Mwinilunga", "Nakambala", "Kalengwa", "Kasumbalesa",
  "Mufulira", "Shangombo", "Mutanda"
];

const styles = {
  body: {
    backgroundColor: '#0d1b2a',
    color: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    minHeight: '100vh',
    margin: 0,
    padding: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  formContainer: {
    backgroundColor: '#1b263b',
    padding: '30px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '400px'
  },
  heading: {
    textAlign: 'center',
    color: '#00b4d8',
    marginBottom: '20px'
  },
  note: {
    textAlign: 'center',
    color: '#90e0ef',
    fontSize: '0.95rem',
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginTop: '15px',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#e0f7fa'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#415a77',
    color: '#ffffff',
    fontSize: '1rem'
  },
  button: {
    marginTop: '20px',
    width: '100%',
    padding: '12px',
    backgroundColor: '#00b4d8',
    color: '#0d1b2a',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease'
  }
};

export default CustomerInfoForm;
