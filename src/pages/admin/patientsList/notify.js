import Swal from "sweetalert2";

// Toast used by the Patients & assignments pages.
const notify = (icon, title) =>
  Swal.fire({
    toast: true,
    position: "top-end",
    icon,
    title,
    showConfirmButton: false,
    timer: icon === "error" ? 4000 : 2500,
  });

export default notify;
