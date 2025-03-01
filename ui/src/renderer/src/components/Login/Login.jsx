import React, { useState } from 'react';
import { Settings, Undo, SunLight, HalfMoon } from 'iconoir-react';
import FormField from '../FormField/FormField';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { logInReq } from '../../services/authReqService/authReqService';
import AlertBox from '../AlertBox/AlertBox';
import useAuth from '../../hooks/useAuth/useAuth';
import Logo from '../Logo/Logo';
import { displayError } from '../../utils/responseUtils/responseUtils';
import { useWindowSize } from '@uidotdev/usehooks';
import { useTheme } from '../../contexts/ThemeContext/ThemeContext';
import { getBaseUrl } from '../../services/configService/configService';

/**
 * Login component - renders the login form.
 * Sets the username and password states for the AuthProvider when successfully logged in with the server
 * On error, displays an error message.
 *
 * @function Login
 * @returns {Login}
 * @constructor
 */
export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [alert, setAlert] = useState({ show: false, message: '', color: 'red' });
    const windowSize = useWindowSize();
    const location = useLocation();

    const [showSettings, setShowSettings] = useState(false);
    const [backendUrl, setBackendUrl] = useState(getBaseUrl());

    const { isDarkMode, toggleTheme } = useTheme();

    const { from, state } = location.state || { from: { pathname: '/' } };

    const auth = useAuth();

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = { username: username, password: password };

        logInReq(data)
            .then((res) => {
                if (res.status === 200) {
                    auth.logIn(res.data['access'], res.data['refresh']);
                }
                navigate(from, { replace: true, state: state });
            })
            .catch(displayError(setAlert));
    };

    const handleSaveSettings = (e) => {
        e.preventDefault();
        localStorage.setItem('backendUrl', backendUrl);
        setShowSettings(false);
    };

    return (
        <div className='flex flex-row items-center justify-center h-screen overflow-y-auto'>
            <div className='bg-cradle3 p-8 bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl w-full h-fit md:w-1/2 xl:w-1/3 relative'>
                {showSettings ? (
                  <>
                    <button
                        onClick={() => {
                            setBackendUrl(localStorage.getItem('backendUrl') || '');
                            setShowSettings(false);
                        }}
                        className='absolute top-2 left-2 p-2 hover:opacity-80 text-gray-500'
                        data-testid='settings-button'
                    >
                        <Undo />
                    </button>
                    <button
                        onClick={toggleTheme}
                        className='absolute top-2 right-2 p-2 hover:opacity-80 text-gray-500'
                        data-testid='theme-button'
                    >
                      {isDarkMode ? <SunLight /> : <HalfMoon />}
                    </button>
                  </>
                ) : (
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className='absolute top-2 right-2 p-2 hover:opacity-80 text-gray-500'
                        data-testid='settings-button'
                    >
                        <Settings />
                    </button>
                )}

                <div className='flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 text-gray-500'>
                    <div className='sm:mx-auto sm:w-full sm:max-w-sm'>
                        {windowSize.height > 800 && (
                            <div className='flex flex-row items-center justify-center'>
                                <Logo text={true} width='80%' />
                            </div>
                        )}
                    </div>
                    <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
                        <form
                            className='space-y-6'
                            onSubmit={showSettings ? handleSaveSettings : handleSubmit}
                        >
                            {showSettings ? (
                                <>
                                    <FormField
                                        name='backendUrl'
                                        labelText='Backend URL'
                                        type='text'
                                        value={backendUrl}
                                        handleInput={setBackendUrl}
                                        autofocus={true}
                                    />
                                    <button
                                        type='submit'
                                        className='btn btn-primary btn-block'
                                    >
                                        Save
                                    </button>
                                </>
                            ) : (
                                <>
                                    <FormField
                                        name='username'
                                        labelText='Username'
                                        type='text'
                                        value={username}
                                        handleInput={setUsername}
                                        autofocus={true}
                                    />
                                    <FormField
                                        name='password'
                                        labelText='Password'
                                        type='password'
                                        value={password}
                                        handleInput={setPassword}
                                    />
                                    <AlertBox alert={alert} />
                                    <button
                                        type='submit'
                                        data-testid='login-register-button'
                                        className='btn btn-primary btn-block'
                                    >
                                        Login
                                    </button>
                                </>
                            )}
                        </form>

                        {/* Hide links when in settings mode */}
                        {!showSettings && (
                            <p className='mt-10 text-center text-sm text-gray-500'>
                                <p className='mt-10 flex justify-between text-sm text-gray-500'>
                                    <Link
                                        to='/forgot-password'
                                        className='font-semibold leading-6 text-cradle2 hover:opacity-90 hover:shadow-gray-400'
                                        replace={true}
                                    >
                                        Forgot Password
                                    </Link>
                                    <Link
                                        to='/register'
                                        className='font-semibold leading-6 text-cradle2 hover:opacity-90 hover:shadow-gray-400'
                                        replace={true}
                                        state={location.state}
                                    >
                                        Register
                                    </Link>
                                </p>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
