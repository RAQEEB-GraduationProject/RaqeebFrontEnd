import SearchPicker from "../../../../components/patients/SearchPicker";

// Searchable list of staff for one role, hiding people already chosen.
const StaffPicker = ({ role, staff, selectedIds, onPick, placeholder }) => {
  const items = staff
    .filter((member) => member.role === role && !selectedIds.includes(member.id))
    .map((member) => ({
      id: member.id,
      title: member.name,
      subtitle: member.detail,
    }));

  return (
    <SearchPicker
      items={items}
      placeholder={placeholder}
      searchPlaceholder="Search staff by name…"
      onPick={onPick}
    />
  );
};

export default StaffPicker;
