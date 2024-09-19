import React, { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile } from "../services/userService";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setUser(data);
        setNombre(data.nombre); // Cambiar a 'nombre'
        setEmail(data.email);
      } catch (err) {
        setError("Error al cargar el perfil del usuario");
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await updateUserProfile({ nombre, email }); // Enviar 'nombre'
      setSuccess("Perfil actualizado con éxito");
    } catch (err) {
      setError("Error al actualizar el perfil");
    }
  };

  if (!user) {
    return <p>Cargando perfil...</p>;
  }

  return (
    <div>
      <h2>Perfil de Usuario</h2>
      <form onSubmit={handleUpdate}>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Actualizar Perfil</button>
        {success && <p>{success}</p>}
        {error && <p>{error}</p>}
      </form>
    </div>
  );
};

export default Profile;
