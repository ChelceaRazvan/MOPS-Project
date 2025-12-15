import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUser } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";
import { getApiErrorMessage } from "../services/error";
import "../styles/global.css";
import "../styles/auth.css";

const schema = z.object({
  username: z.string().min(3, "Username minim 3 caractere"),
  password: z.string().min(6, "Parolă minim 6 caractere"),
  firstName: z.string().min(1, "Prenumele este obligatoriu"),
  lastName: z.string().min(1, "Numele este obligatoriu"),
  roleInCompany: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email invalid").optional(),
  roleName: z.string().min(2, "RoleName minim 2 caractere").optional(),
});
type FormData = z.infer<typeof schema>;

const Register: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { roleName: "User" }, // implicit
  });
  const navigate = useNavigate();

  const onSubmit = async (values: FormData) => {
    try {
      const payload = { ...values, status: 1 }; // activ
      const res = await registerUser(payload);
      console.log("Register OK:", res?.data);
      alert("Înregistrare reușită!");
      navigate("/login");
    } catch (err) {
      alert(getApiErrorMessage(err));
    }
  };

  return (
    <div className="app-center">
      <div className="card">
        <h1>Înregistrare</h1>
        <p className="sub">Creează un cont nou</p>

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

          <div className="form-grid-2">
            <div className="form-group">
              <label className="label">Prenume</label>
              <input className="input" {...register("firstName")} />
              {errors.firstName && <p className="error">{errors.firstName.message}</p>}
            </div>
            <div className="form-group">
              <label className="label">Nume</label>
              <input className="input" {...register("lastName")} />
              {errors.lastName && <p className="error">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="label">Funcție în companie</label>
            <input className="input" {...register("roleInCompany")} />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="label">Telefon</label>
              <input className="input" {...register("phone")} />
            </div>
            <div className="form-group">
              <label className="label">Email</label>
              <input className="input" type="email" {...register("email")} />
              {errors.email && <p className="error">{errors.email.message}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="label">Role Name</label>
            <input className="input" {...register("roleName")} />
            {errors.roleName && <p className="error">{errors.roleName.message}</p>}
          </div>

          <button className="btn" disabled={isSubmitting} type="submit" style={{ marginTop: 8 }}>
            {isSubmitting ? "Se creează..." : "Creează cont"}
          </button>
        </form>

        <div className="footer">
          Ai deja cont? <Link to="/login">Autentifică-te</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
