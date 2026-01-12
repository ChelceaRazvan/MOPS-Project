
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUser } from "../services/auth";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { getApiErrorMessage } from "../services/error";
import "../styles/global.css";
import "../styles/auth.css";

const schema = z.object({
  username: z.string().min(3, "Minim 3 caractere"),
  password: z.string().min(6, "Minim 6 caractere"),
});

type FormData = z.infer<typeof schema>;

const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (values: FormData) => {
    console.log("Login payload:", values); // <- vezi ce trimiți
    try {
      const res = await loginUser(values);
      login({ token: res.token, user: res.user });
      navigate("/dashboard");
    } catch (err) {
      alert(getApiErrorMessage(err));
    }
  };

  return (
    <div className="app-center">
      <div className="card">
        <h2>Autentificare</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="label">Username</label>
            <input className="input" {...register("username")} />
            {errors.username && <p className="error">{errors.username.message}</p>}
          </div>

          <div className="form-group">
            <label className="label">Parolă</label>
            <input className="input" type="password" {...register("password")} />
            {errors.password && <p className="error">{errors.password.message}</p>}
          </div>

          <button className="btn" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Se autentifică..." : "Login"}
          </button>
        </form>

        <div className="footer">
          Nu ai cont? <Link to="/register">Înregistrează-te</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
