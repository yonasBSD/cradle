import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useCradleNavigate from '../../hooks/useCradleNavigate/useCradleNavigate';
import { registerReq } from '../../services/authReqService/authReqService';
import { displayError } from '../../utils/responseUtils/responseUtils';
import AlertBox from '../AlertBox/AlertBox';
import FormField from '../FormField/FormField';

/**
 * Register component - renders the registration form.
 * Register new user in the system.
 * On successful registration, user is redirected to the login page.
 * On error, displays an error message.
 *
 * @function Register
 * @returns {Register}
 * @constructor
 */
export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordCheck, setPasswordCheck] = useState('');
    const [alert, setAlert] = useState({ show: false, message: '', color: 'red' });
    const { navigate, navigateLink } = useCradleNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== passwordCheck) {
            setAlert({ show: true, message: 'Passwords do not match.', color: 'red' });
            return;
        }

        const data = { username: username, email: email, password: password };

        registerReq(data)
            .then(() => navigate('/login', { state: location.state, replace: true }))
            .catch(displayError(setAlert));
    };

    return (
        <div className='flex flex-row items-center justify-center h-screen overflow-y-auto'>
            <div className='bg-cradle3 p-8 bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl w-full h-fit md:w-1/2 md:h-fit xl:w-1/3'>
                <div className='flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8'>
                    <div className='sm:mx-auto sm:w-full sm:max-w-sm'>
                        <h1 className='mt-10 text-primary text-center text-2xl font-bold leading-9 tracking-tight text-cradle2'>
                            Register
                        </h1>
                    </div>
                    <div
                        name='register-form'
                        className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'
                    >
                        <form className='space-y-6' onSubmit={handleSubmit}>
                            <FormField
                                name='username'
                                labelText='Username'
                                type='text'
                                value={username}
                                handleInput={setUsername}
                                autofocus={true}
                            />
                            <FormField
                                name='email'
                                labelText='Email'
                                type='email'
                                value={email}
                                handleInput={setEmail}
                            />
                            <FormField
                                name='password'
                                labelText='Password'
                                type='password'
                                value={password}
                                handleInput={setPassword}
                            />
                            <FormField
                                name='password-check'
                                labelText='Confirm Password'
                                type='password'
                                value={passwordCheck}
                                handleInput={setPasswordCheck}
                            />
                            <AlertBox alert={alert} />
                            <button
                                type='submit'
                                data-testid='login-register-button'
                                className='btn btn-primary btn-block'
                            >
                                Register
                            </button>
                        </form>
                        <p className='mt-10 text-center text-sm text-gray-500'>
                            <Link
                                to='/login'
                                className='text-primary font-semibold leading-6 text-cradle2 hover:opacity-90 hover:shadow-gray-400'
                                state={location.state}
                                replace={true}
                            >
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
