import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button, Loading, Textbox } from "../components";
import {
  useLoginMutation,
  useRegisterMutation,
} from "../redux/slices/api/authApiSlice";
import { setCredentials } from "../redux/slices/authSlice";

const AUTH_MODES = {
  login: "login",
  signup: "signup",
  admin: "admin",
};

const Login = () => {
  const { user } = useSelector((state) => state.auth);
  const [mode, setMode] = useState(AUTH_MODES.login);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      title: "",
      email: "",
      password: "",
    },
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [registerUser, { isLoading: isRegistering }] = useRegisterMutation();

  const isSignup = mode === AUTH_MODES.signup;
  const isAdminLogin = mode === AUTH_MODES.admin;
  const isLoading = isLoggingIn || isRegistering;

  useEffect(() => {
    reset({ name: "", title: "", email: "", password: "" });
  }, [mode, reset]);

  const handleLogin = async (data) => {
    try {
      if (isSignup) {
        await registerUser({ ...data, isAdmin: false }).unwrap();
        toast.success("Signup successful. Please log in.");
        setMode(AUTH_MODES.login);
        return;
      }

      const res = await login({ ...data, loginAs: isAdminLogin ? "admin" : "user" }).unwrap();

      dispatch(setCredentials(res));
      navigate("/");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  useEffect(() => {
    user && navigate("/dashboard");
  }, [user]);

  return (
    <div className='w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#f3f4f6] dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#302943] via-slate-900 to-black'>
      <div className='w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center'>
        <div className='h-full w-full lg:w-2/3 flex flex-col items-center justify-center'>
          <div className='w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20'>
            <p className='flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 2xl:text-7xl font-black text-center dark:text-gray-400 text-blue-700'>
              <span>Task Manager</span>
            </p>

            <div className='cell'>
              <div className='circle rotate-in-up-left'></div>
            </div>
          </div>
        </div>

        <div className='w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center'>
          <form
            onSubmit={handleSubmit(handleLogin)}
            className='form-container w-full md:w-[400px] flex flex-col gap-y-8 bg-white dark:bg-slate-900 px-10 pt-14 pb-14'
          >
            <div>
              <p className='text-blue-600 text-3xl font-bold text-center'>
                {isSignup
                  ? "Create your account"
                  : isAdminLogin
                    ? "Admin Login"
                    : "Welcome back!"}
              </p>
              <p className='text-center text-base text-gray-700 dark:text-gray-500'>
                {isSignup
                  ? "Signup as a normal user account"
                  : isAdminLogin
                    ? "Only admin users can continue from here"
                    : "Keep all your credetials safe!"}
              </p>
            </div>

            <div className='grid grid-cols-3 gap-2 rounded-full bg-gray-100 p-1 text-sm font-semibold'>
              <button
                type='button'
                onClick={() => setMode(AUTH_MODES.login)}
                className={`rounded-full px-3 py-2 transition-colors ${mode === AUTH_MODES.login
                  ? "bg-blue-600 text-white"
                  : "text-gray-600"
                  }`}
              >
                User Login
              </button>
              <button
                type='button'
                onClick={() => setMode(AUTH_MODES.signup)}
                className={`rounded-full px-3 py-2 transition-colors ${mode === AUTH_MODES.signup
                  ? "bg-blue-600 text-white"
                  : "text-gray-600"
                  }`}
              >
                Sign Up
              </button>
              <button
                type='button'
                onClick={() => setMode(AUTH_MODES.admin)}
                className={`rounded-full px-3 py-2 transition-colors ${mode === AUTH_MODES.admin
                  ? "bg-blue-600 text-white"
                  : "text-gray-600"
                  }`}
              >
                Admin Login
              </button>
            </div>

            <div className='flex flex-col gap-y-5'>
              {isSignup && (
                <Textbox
                  placeholder='Full name'
                  type='text'
                  name='name'
                  label='Full Name'
                  className='w-full rounded-full'
                  register={register("name", {
                    required: "Full Name is required!",
                  })}
                  error={errors.name ? errors.name.message : ""}
                />
              )}

              {isSignup && (
                <Textbox
                  placeholder='Title'
                  type='text'
                  name='title'
                  label='Title'
                  className='w-full rounded-full'
                  register={register("title", {
                    required: "Title is required!",
                  })}
                  error={errors.title ? errors.title.message : ""}
                />
              )}

              <Textbox
                placeholder='you@example.com'
                type='email'
                name='email'
                label='Email Address'
                className='w-full rounded-full'
                register={register("email", {
                  required: "Email Address is required!",
                })}
                error={errors.email ? errors.email.message : ""}
              />
              <Textbox
                placeholder='password'
                type='password'
                name='password'
                label='Password'
                className='w-full rounded-full'
                register={register("password", {
                  required: "Password is required!",
                })}
                error={errors.password ? errors.password?.message : ""}
              />
              <span className='text-sm text-gray-600 hover:underline cursor-pointer'>
                Forget Password?
              </span>
            </div>
            {isLoading ? (
              <Loading />
            ) : (
              <Button
                type='submit'
                label={isSignup ? "Sign up" : isAdminLogin ? "Admin login" : "Log in"}
                className='w-full h-10 bg-blue-700 text-white rounded-full'
              />
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
