// Dados Iniciais dos Colaboradores - Grupo de Gestão
// Atualização original: 09/09/2026

const INITIAL_COLLABORATORS = [
  {
    id: "colab-1",
    name: "Adeniuso",
    cpf_cfp: "108",
    avatarUrl: "",
    cargo: "Gestão Operacional",
    schedule: {
      1: { active: true, start: "07:00", end: "16:00", cfp: "108" }, // 2ª
      2: { active: true, start: "07:00", end: "16:00", cfp: "108" }, // 3ª
      3: { active: true, start: "07:00", end: "16:00", cfp: "108" }, // 4ª
      4: { active: true, start: "07:00", end: "16:00", cfp: "108" }, // 5ª
      5: { active: true, start: "07:00", end: "16:00", cfp: "108" }, // 6ª
      6: { active: false, start: "", end: "", cfp: "" },              // Sáb
      0: { active: false, start: "", end: "", cfp: "" }               // Dom
    }
  },
  {
    id: "colab-2",
    name: "Leandro",
    cpf_cfp: "103",
    avatarUrl: "",
    cargo: "Gestão Operacional",
    schedule: {
      1: { active: true, start: "07:00", end: "16:00", cfp: "103" },
      2: { active: true, start: "07:00", end: "16:00", cfp: "103" },
      3: { active: true, start: "07:00", end: "16:00", cfp: "103" },
      4: { active: true, start: "07:00", end: "16:00", cfp: "103" },
      5: { active: true, start: "07:00", end: "16:00", cfp: "103" },
      6: { active: false, start: "", end: "", cfp: "" },
      0: { active: false, start: "", end: "", cfp: "" }
    }
  },
  {
    id: "colab-3",
    name: "Ana Paula Baum",
    cpf_cfp: "108",
    avatarUrl: "",
    cargo: "Gestão Operacional",
    schedule: {
      1: { active: false, start: "", end: "", cfp: "108", isOff: true }, // Folga
      2: { active: true, start: "09:00", end: "18:00", cfp: "108" },
      3: { active: true, start: "12:50", end: "21:50", cfp: "108" },
      4: { active: true, start: "12:50", end: "21:50", cfp: "108" },
      5: { active: true, start: "09:00", end: "18:00", cfp: "108" },
      6: { active: true, start: "09:00", end: "18:00", cfp: "108" },
      0: { active: false, start: "", end: "", cfp: "" }
    }
  },
  {
    id: "colab-4",
    name: "Ana Paula Guerreiro",
    cpf_cfp: "108 / 103",
    avatarUrl: "",
    cargo: "Gestão Operacional",
    schedule: {
      1: { active: true, start: "08:00", end: "17:00", cfp: "108" },
      2: { active: true, start: "08:00", end: "17:00", cfp: "108" },
      3: { active: true, start: "08:00", end: "17:00", cfp: "108" },
      4: { active: true, start: "08:00", end: "17:00", cfp: "103" },
      5: { active: true, start: "08:00", end: "17:00", cfp: "108" },
      6: { active: false, start: "", end: "", cfp: "" },
      0: { active: false, start: "", end: "", cfp: "" }
    }
  },
  {
    id: "colab-5",
    name: "Edilson",
    cpf_cfp: "103",
    avatarUrl: "",
    cargo: "Gestão Operacional",
    schedule: {
      1: { active: true, start: "13:00", end: "22:00", cfp: "103" },
      2: { active: true, start: "09:00", end: "18:00", cfp: "103" },
      3: { active: true, start: "07:30", end: "16:30", cfp: "103" },
      4: { active: true, start: "07:30", end: "16:30", cfp: "103" },
      5: { active: true, start: "13:00", end: "22:00", cfp: "103" },
      6: { active: false, start: "", end: "", cfp: "" },
      0: { active: false, start: "", end: "", cfp: "" }
    }
  },
  {
    id: "colab-6",
    name: "Edson",
    cpf_cfp: "103",
    avatarUrl: "",
    cargo: "Gestão Operacional",
    schedule: {
      1: { active: false, start: "", end: "", cfp: "103", isOff: true }, // Folga
      2: { active: true, start: "13:00", end: "22:00", cfp: "103" },
      3: { active: true, start: "13:00", end: "22:00", cfp: "103" },
      4: { active: true, start: "13:00", end: "22:00", cfp: "103" },
      5: { active: true, start: "09:00", end: "18:00", cfp: "103" },
      6: { active: true, start: "09:00", end: "18:00", cfp: "103" },
      0: { active: false, start: "", end: "", cfp: "" }
    }
  },
  {
    id: "colab-7",
    name: "Eduardo",
    cpf_cfp: "103 / 108",
    avatarUrl: "",
    cargo: "Gestão Operacional",
    schedule: {
      1: { active: true, start: "08:00", end: "17:00", cfp: "103" },
      2: { active: true, start: "08:00", end: "17:00", cfp: "108" },
      3: { active: true, start: "08:00", end: "17:00", cfp: "108" },
      4: { active: true, start: "08:00", end: "17:00", cfp: "108" },
      5: { active: true, start: "08:00", end: "17:00", cfp: "103" },
      6: { active: false, start: "", end: "", cfp: "" },
      0: { active: false, start: "", end: "", cfp: "" }
    }
  },
  {
    id: "colab-8",
    name: "Eliane",
    cpf_cfp: "103",
    avatarUrl: "",
    cargo: "Gestão Operacional",
    schedule: {
      1: { active: true, start: "08:00", end: "17:00", cfp: "103" },
      2: { active: true, start: "08:00", end: "17:00", cfp: "103" },
      3: { active: true, start: "08:00", end: "17:00", cfp: "103" },
      4: { active: true, start: "08:00", end: "17:00", cfp: "103" },
      5: { active: true, start: "08:00", end: "17:00", cfp: "103" },
      6: { active: false, start: "", end: "", cfp: "" },
      0: { active: false, start: "", end: "", cfp: "" }
    }
  },
  {
    id: "colab-9",
    name: "Jefferson",
    cpf_cfp: "103",
    avatarUrl: "",
    cargo: "Gestão Operacional",
    schedule: {
      1: { active: true, start: "08:00", end: "17:00", cfp: "103" },
      2: { active: true, start: "08:00", end: "17:00", cfp: "103" },
      3: { active: true, start: "08:00", end: "17:00", cfp: "103" },
      4: { active: true, start: "08:00", end: "17:00", cfp: "103" },
      5: { active: true, start: "08:00", end: "17:00", cfp: "103" },
      6: { active: false, start: "", end: "", cfp: "" },
      0: { active: false, start: "", end: "", cfp: "" }
    }
  },
  {
    id: "colab-10",
    name: "João Manoel",
    cpf_cfp: "108",
    avatarUrl: "",
    cargo: "Gestão Operacional",
    schedule: {
      1: { active: true, start: "13:00", end: "22:00", cfp: "108" },
      2: { active: true, start: "13:00", end: "22:00", cfp: "108" },
      3: { active: false, start: "", end: "", cfp: "108", isOff: true }, // Folga
      4: { active: true, start: "13:00", end: "22:00", cfp: "108" },
      5: { active: true, start: "13:00", end: "22:00", cfp: "108" },
      6: { active: true, start: "09:00", end: "18:00", cfp: "108" },
      0: { active: false, start: "", end: "", cfp: "" }
    }
  },
  {
    id: "colab-11",
    name: "Laercio",
    cpf_cfp: "108",
    avatarUrl: "",
    cargo: "Gestão Operacional",
    schedule: {
      1: { active: true, start: "13:00", end: "22:00", cfp: "108" },
      2: { active: true, start: "09:00", end: "18:00", cfp: "108" },
      3: { active: true, start: "13:00", end: "22:00", cfp: "108" },
      4: { active: true, start: "09:00", end: "18:00", cfp: "108" },
      5: { active: true, start: "08:00", end: "17:00", cfp: "108" },
      6: { active: false, start: "", end: "", cfp: "" },
      0: { active: false, start: "", end: "", cfp: "" }
    }
  },
  {
    id: "colab-12",
    name: "Lidiane",
    cpf_cfp: "108 / 103",
    avatarUrl: "",
    cargo: "Gestão Operacional",
    schedule: {
      1: { active: true, start: "07:30", end: "16:30", cfp: "108" },
      2: { active: true, start: "07:30", end: "16:30", cfp: "103" },
      3: { active: true, start: "07:30", end: "16:30", cfp: "108" },
      4: { active: true, start: "07:00", end: "16:00", cfp: "103" },
      5: { active: true, start: "07:30", end: "16:30", cfp: "108" },
      6: { active: false, start: "", end: "", cfp: "" },
      0: { active: false, start: "", end: "", cfp: "" }
    }
  },
  {
    id: "colab-13",
    name: "Marcos",
    cpf_cfp: "108",
    avatarUrl: "",
    cargo: "Gestão Operacional",
    schedule: {
      1: { active: true, start: "08:00", end: "17:00", cfp: "108" },
      2: { active: true, start: "08:00", end: "17:00", cfp: "108" },
      3: { active: true, start: "08:00", end: "17:00", cfp: "108" },
      4: { active: true, start: "08:00", end: "17:00", cfp: "108" },
      5: { active: true, start: "08:00", end: "17:00", cfp: "108" },
      6: { active: false, start: "", end: "", cfp: "" },
      0: { active: false, start: "", end: "", cfp: "" }
    }
  },
  {
    id: "colab-14",
    name: "Mauro",
    cpf_cfp: "108",
    avatarUrl: "",
    cargo: "Gestão Operacional",
    schedule: {
      1: { active: true, start: "08:00", end: "17:00", cfp: "108" },
      2: { active: true, start: "08:00", end: "17:00", cfp: "108" },
      3: { active: true, start: "08:00", end: "17:00", cfp: "108" },
      4: { active: true, start: "07:00", end: "16:00", cfp: "108" },
      5: { active: true, start: "08:00", end: "17:00", cfp: "108" },
      6: { active: false, start: "", end: "", cfp: "" },
      0: { active: false, start: "", end: "", cfp: "" }
    }
  },
  {
    id: "colab-15",
    name: "Mayra",
    cpf_cfp: "108",
    avatarUrl: "",
    cargo: "Gestão Operacional",
    schedule: {
      1: { active: true, start: "08:00", end: "17:00", cfp: "108" },
      2: { active: true, start: "12:00", end: "21:00", cfp: "108" },
      3: { active: true, start: "08:00", end: "17:00", cfp: "108" },
      4: { active: true, start: "12:00", end: "21:00", cfp: "108" },
      5: { active: true, start: "12:00", end: "21:00", cfp: "108" },
      6: { active: false, start: "", end: "", cfp: "" },
      0: { active: false, start: "", end: "", cfp: "" }
    }
  },
  {
    id: "colab-16",
    name: "Silvia",
    cpf_cfp: "103",
    avatarUrl: "",
    cargo: "Gestão Operacional",
    schedule: {
      1: { active: true, start: "08:00", end: "17:00", cfp: "103" },
      2: { active: true, start: "07:00", end: "16:00", cfp: "103" },
      3: { active: true, start: "08:00", end: "17:00", cfp: "103" },
      4: { active: true, start: "08:00", end: "17:00", cfp: "103" },
      5: { active: true, start: "08:00", end: "17:00", cfp: "103" },
      6: { active: false, start: "", end: "", cfp: "" },
      0: { active: false, start: "", end: "", cfp: "" }
    }
  }
];

// Dias da semana mapeados de 0 (Domingo) a 6 (Sábado)
const WEEK_DAYS = [
  { key: 0, short: "Dom", name: "Domingo" },
  { key: 1, short: "2ª", name: "2ª-feira" },
  { key: 2, short: "3ª", name: "3ª-feira" },
  { key: 3, short: "4ª", name: "4ª-feira" },
  { key: 4, short: "5ª", name: "5ª-feira" },
  { key: 5, short: "6ª", name: "6ª-feira" },
  { key: 6, short: "Sáb", name: "Sábado" }
];
