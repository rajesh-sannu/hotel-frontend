import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorInput, setErrorInput] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      setErrorInput(true);
      return;
    }

    try {
      setLoading(true);
      setErrorInput(false);

      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const contentType = res.headers.get("content-type");

      if (!res.ok) {
        const message = contentType?.includes("application/json")
          ? (await res.json()).message
          : await res.text();
        throw new Error(message || "Login failed");
      }

      const data = await res.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("email", email);

      toast.success("🎉 Login Successful");

      // Delay for toast visibility
      setTimeout(() => {
        navigate(data.role === "admin" ? "/admin" : "/tables");
      }, 1000);
    } catch (err) {
      toast.error(err.message || "Invalid credentials");
      setErrorInput(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 p-4 md:p-8">
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          className: 'text-sm md:text-base',
          duration: 3000,
        }}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md mx-auto"
      >
        {/* Decorative elements - Hidden on small mobile, visible on larger screens */}
        <motion.div 
          className="hidden sm:block absolute -top-14 -left-10 w-20 h-20 md:w-28 md:h-28 bg-pink-200 rounded-full mix-blend-multiply opacity-70"
          animate={{
            scale: [1, 1.1, 1],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="hidden sm:block absolute -bottom-8 -right-6 w-16 h-16 md:w-24 md:h-24 bg-purple-200 rounded-full mix-blend-multiply opacity-70"
          animate={{
            scale: [1, 1.1, 1],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="hidden sm:block absolute top-20 -right-10 w-14 h-14 md:w-20 md:h-20 bg-indigo-200 rounded-full mix-blend-multiply opacity-70"
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -15, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Login form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden p-6 md:p-8 space-y-4 md:space-y-6"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
              Welcome Back
            </h2>
            <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">Sign in to access your account</p>
          </div>

          <div className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="email"
                placeholder="Enter your email"
                className={`w-full px-4 py-2 md:py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 text-sm md:text-base
                  ${errorInput ? "border-red-500 ring-red-200" : "border-gray-300 focus:border-purple-500 focus:ring-purple-200"}
                `}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="password"
                placeholder="Enter your password"
                className={`w-full px-4 py-2 md:py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 text-sm md:text-base
                  ${errorInput ? "border-red-500 ring-red-200" : "border-gray-300 focus:border-purple-500 focus:ring-purple-200"}
                `}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 shadow-md text-sm md:text-base
              ${loading
                ? "bg-gradient-to-r from-pink-300 to-purple-300 cursor-not-allowed"
                : "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"}
              text-white relative overflow-hidden`}
          >
            {loading && (
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="absolute inset-0 bg-white/20 w-full h-full"
                transition={{ repeat: Infinity, duration: 0.8 }}
              />
            )}
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : "Login"}
          </motion.button>

          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-xs md:text-sm text-purple-600 hover:text-purple-800 transition-colors duration-300 font-medium"
            >
              Forgot Password?
            </Link>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-xs md:text-sm text-gray-600 pt-3 md:pt-4 border-t border-gray-200"
          >
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-purple-600 hover:text-purple-800 transition-colors duration-300">
              Sign up
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}