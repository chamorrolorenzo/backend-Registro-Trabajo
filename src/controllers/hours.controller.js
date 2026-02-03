import Hour from "../models/Hour.js";

/* =========================
   CRUD (SE CONSERVA)
========================= */

// Obtener horas del usuario
export const getHours = async (req, res) => {
  try {
    const hours = await Hour.find({
      userId: req.user.id,
    }).sort({ date: -1 });

    res.json(hours);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener horas",
    });
  }
};

// Crear hora manual (admin / correcciones)
export const createHour = async (req, res) => {
  try {
    const { date, entryTime, exitTime, totalMinutes } = req.body;

    const hour = await Hour.create({
      userId: req.user.id,
      companyId: req.user.companyId,
      date,
      entryTime,
      exitTime,
      totalMinutes,
    });

    res.status(201).json(hour);
  } catch (error) {
    res.status(500).json({
      message: "Error al crear hora",
    });
  }
};

// Actualizar hora
export const updateHour = async (req, res) => {
  try {
    const hour = await Hour.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );

    if (!hour) {
      return res.status(404).json({
        message: "Hora no encontrada",
      });
    }

    res.json(hour);
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar hora",
    });
  }
};

// Eliminar hora
export const deleteHour = async (req, res) => {
  try {
    const hour = await Hour.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!hour) {
      return res.status(404).json({
        message: "Hora no encontrada",
      });
    }

    res.json({
      message: "Hora eliminada",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar hora",
    });
  }
};

/*  CLOCK IN / CLOCK OUT */

// Ingreso automático
export const entryHour = async (req, res) => {
  try {
    const now = new Date();

    // Día laboral normalizado (00:00)
    const date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    // Verificar si ya hay una hora abierta
    const openHour = await Hour.findOne({
      userId: req.user.id,
      date,
      exitTime: null,
    });

    if (openHour) {
      return res.status(400).json({
        message: "Ya existe un ingreso activo",
      });
    }

    const hour = await Hour.create({
      userId: req.user.id,
      companyId: req.user.companyId,
      date,
      entryTime: now,
    });

    res.status(201).json(hour);
  } catch (error) {
    res.status(500).json({
      message: "Error al registrar ingreso",
    });
  }
};

// Salida automática
export const exitHour = async (req, res) => {
  try {
    const hour = await Hour.findOne({
      userId: req.user.id,
      exitTime: null,
    });

    if (!hour) {
      return res.status(400).json({
        message: "No hay un ingreso activo",
      });
    }

    const now = new Date();
    const totalMinutes = Math.floor(
      (now - hour.entryTime) / 60000
    );

    hour.exitTime = now;
    hour.totalMinutes = totalMinutes;

    await hour.save();

    res.json(hour);
  } catch (error) {
    res.status(500).json({
      message: "Error al registrar salida",
    });
  }
};
