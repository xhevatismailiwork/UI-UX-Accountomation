import { AppUser } from "../types";

export const USERS: AppUser[] = [
  { id: "1", emri: "Bekim Rexhepi", email: "bekim@faturasys.mk", roli: "superadmin", kompanite: [] },
  { id: "2", emri: "Burim Ismaili", email: "burim@kontabiliteti.mk", roli: "admin", kompanite: [], shtuarNga: "Bekim Rexhepi" },
  { id: "3", emri: "Ana Petrovska", email: "ana@kontabiliteti.mk", roli: "kontabilist", kompanite: ["7891234", "4521789", "3318765"], shtuarNga: "Burim Ismaili" },
  { id: "4", emri: "Petar Ivanov", email: "petar@kontabiliteti.mk", roli: "kontabilist", kompanite: ["9987654", "6654321"], shtuarNga: "Burim Ismaili" },
  { id: "5", emri: "Marko Nikolovski", email: "marko@techsoft.mk", roli: "operator", kompanite: ["7891234"] },
  { id: "6", emri: "Blerim Osmani", email: "blerim@techsoft.mk", roli: "sme_owner", kompanite: ["7891234"] },
];
