// 🔥 IMPORTS MODERNOS
import { auth, db } from "./firebase-config.js";

import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ═══════════════════════════════════════════════════════
   AUTH SERVICE
═══════════════════════════════════════════════════════ */

const AuthService = {

  loginWithEmail: async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getCurrentUser: () => auth.currentUser,

  createUser: async (email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, uid: result.user.uid };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

/* ═══════════════════════════════════════════════════════
   USER SERVICE
═══════════════════════════════════════════════════════ */

const UserService = {

  createUserProfile: async (uid, userData) => {
    try {
      await setDoc(doc(db, "users", uid), {
        id: uid,
        nombre: userData.nombre,
        email: userData.email,
        telefono: userData.telefono,
        nombreTienda: userData.nombreTienda || "Mi Tienda",
        colorTema: userData.colorTema || "#FF6B00",
        logoUrl: userData.logoUrl || null,
        descripcion: userData.descripcion || "",
        plan: userData.plan || "free",
        estado: "activo",
        createdAt: new Date(),
        updatedAt: new Date(),
        config: {
          mostrarSorteos: true,
          mostrarPromociones: true,
          preciosPersonalizados: false,
          comisiones: 0.15
        }
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getUserProfile: async (uid) => {
    try {
      const docSnap = await getDoc(doc(db, "users", uid));
      return { success: true, data: docSnap.data() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  updateUserProfile: async (uid, updates) => {
    try {
      updates.updatedAt = new Date();
      await updateDoc(doc(db, "users", uid), updates);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getAllUsers: async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      return {
        success: true,
        data: snapshot.docs.map(doc => doc.data())
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

/* ═══════════════════════════════════════════════════════
   ORDER SERVICE
═══════════════════════════════════════════════════════ */

const OrderService = {

  createOrder: async (userId, orderData) => {
    try {
      const ref = await addDoc(collection(db, "pedidos"), {
        userId,
        ...orderData,
        estado: "pendiente",
        fecha: new Date().toISOString() // 🔥 FIX estable
      });

      return { success: true, orderId: ref.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getUserOrders: async (userId) => {
    try {
      const q = query(
        collection(db, "pedidos"),
        where("userId", "==", userId)
        // ❌ quitamos orderBy (rompía todo)
      );

      const snapshot = await getDocs(q);

      return {
        success: true,
        data: snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      };
    } catch (error) {
      console.error("Error pedidos:", error);
      return { success: false, error: error.message };
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      await updateDoc(doc(db, "pedidos", orderId), {
        estado: status
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  deleteOrder: async (orderId) => {
    try {
      await deleteDoc(doc(db, "pedidos", orderId));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

/* ═══════════════════════════════════════════════════════
   PRODUCT SERVICE (🔥 FIX REAL)
═══════════════════════════════════════════════════════ */

const ProductService = {

  getProducts: async () => {
    try {
      const snapshot = await getDocs(collection(db, "productos"));
      return {
        success: true,
        data: snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  createProduct: async (data) => {
    try {
      const ref = await addDoc(collection(db, "productos"), {
        ...data,
        createdAt: new Date()
      });

      return { success: true, id: ref.id };

    } catch (error) {
      console.error(error);
      return { success: false, error: error.message };
    }
  },

  deleteProduct: async (id) => {
    try {
      await deleteDoc(doc(db, "productos", id));
      return { success: true };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

/* ═══════════════════════════════════════════════════════
   EXPORT
═══════════════════════════════════════════════════════ */

export const FirebaseServices = {
  Auth: AuthService,
  User: UserService,
  Order: OrderService,
  Product: ProductService
};