import DoctorPatients from "../../doctor/doctorPatients/DoctorPatients";

// Same clinical patient list as the doctor's (search, filters, priority
// sorting, real GET /Patients data limited by the backend to the nurse's
// assigned patients); rows open the shared details at /nurse/patients/:id.
const NursePatients = () => <DoctorPatients patientsPath="/nurse/patients" />;

export default NursePatients;
