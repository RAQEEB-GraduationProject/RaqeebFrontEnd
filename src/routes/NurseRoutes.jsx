import { Route, Navigate } from "react-router-dom";
import NurseLayout from "../layouts/NurseLayout";
import NurseDashboard from "../pages/nurse/dashboard/NurseDashboard";
import NursePatients from "../pages/nurse/nursePatients/NursePatients";
import NurseAlerts from "../pages/nurse/nurseAlerts/NurseAlerts";
import NurseCheckIns from "../pages/nurse/nurseCheckIns/NurseCheckIns";
import NurseMedications from "../pages/nurse/nurseMedications/NurseMedications";
import NurseAccount from "../pages/nurse/nurseAccount/NurseAccount";

const NurseRoutes = (
  <Route path="/nurse" element={<NurseLayout />}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<NurseDashboard />} />
    <Route path="patients" element={<NursePatients />} />
    <Route path="alerts" element={<NurseAlerts />} />
    <Route path="check-ins" element={<NurseCheckIns />} />
    <Route path="medications" element={<NurseMedications />} />
    <Route path="account" element={<NurseAccount />} />
  </Route>
);

export default NurseRoutes;
