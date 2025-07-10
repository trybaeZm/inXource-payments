import Swal from 'sweetalert2';
import { useState, type ChangeEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import payment from '../api/payment';
import type { CustomerType } from '../types/types';

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
    business_id: location.state?.business_id,
    name: '',
    email: ''
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  interface AddCustomerResponse {
    id?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    location?: string;
    phone?: string;
    business_id?: string;
    name?: string;
    email?: string;
    // Add other expected properties here as needed
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const customerData: CustomerType = {
      ...formData,
      name: formData.firstName + ' ' + formData.lastName
    };

    try {
      const response: AddCustomerResponse[] = await payment.addCustomer(customerData);
      const res = response[0];

      if (res) {
        navigation('/payment/product', { state: { res } })
      }
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : 'An unexpected error occurred';
      Swal.fire('error', errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className='min-h-screen  py-10 flex flex-col items-center bg-gray-800 text-white'>
      <div className=' max-w-md'>
        <div className="text-center text-white text-3xl  font-semibold mb-5">
          Customer Details
        </div>
        <p className="text-center text-white text-sm mb-5">
          Hi there! Since it’s your first time, we just need a few quick details to get to know you better.
          Don’t worry—this is a one-time request, and we won’t ask again.
        </p>
      </div>
      <div className=" w-full flex items-center justify-center p-4">
        <div className="bg-gray-700 shadow-md p-8 rounded-xl w-full max-w-2xl">
          <form onSubmit={handleSubmit}>
            <label className="block mt-4 mb-1 font-semibold text-[#e0f7fa]" htmlFor="firstName">First Name</label>
            <input
              className="w-full p-3 rounded-md bg-[#415a77] text-white text-base focus:outline-none"
              type="text"
              id="firstName"
              name="firstName"
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />

            <label className="block mt-4 mb-1 font-semibold text-[#e0f7fa]" htmlFor="lastName">Last Name</label>
            <input
              className="w-full p-3 rounded-md bg-[#415a77] text-white text-base focus:outline-none"
              type="text"
              id="lastName"
              name="lastName"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />

            <label className="block mt-4 mb-1 font-semibold text-[#e0f7fa]" htmlFor="email">Email</label>
            <input
              className="w-full p-3 rounded-md bg-[#415a77] text-white text-base focus:outline-none"
              type="email"
              id="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div className='flex flex-wrap gap-4'>
              <div className='grow'>
                <label className="block mt-4 mb-1 font-semibold text-[#e0f7fa]" htmlFor="gender">Gender</label>
                <select
                  className="w-full p-3 rounded-md bg-[#415a77] text-white text-base focus:outline-none"
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
              </div>
              <div className='grow'>
                <label className="block mt-4 mb-1 font-semibold text-[#e0f7fa]" htmlFor="location">Town or Province</label>
                <select
                  className="w-full p-3 rounded-md bg-[#415a77] text-white text-base focus:outline-none"
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
              </div>
            </div>
            <button
              type="submit"
              className={`mt-6 w-full py-3 rounded-md font-bold bg-blue-700 text-white transition duration-300 ${loading
                ? ' opacity-50 cursor-not-allowed'
                : ' hover:bg-[#0096c7] cursor-pointer'
                }`}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Proceed to Payment'}
            </button>
          </form>
        </div>
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


export default CustomerInfoForm;
