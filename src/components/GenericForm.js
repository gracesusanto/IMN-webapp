import { Alert, Box, Button, Stack, TextField } from "@mui/material";

export default function GenericForm({
  currentData,
  setCurrentData,
  handleSubmit,
  message,
  fields,
  errors,
}) {
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        {fields.map((field) => (
          <TextField
            key={field.name}
            label={field.label}
            type={field.type}
            name={field.name}
            value={currentData[field.name] ?? ""}
            onChange={(e) =>
              setCurrentData({ ...currentData, [field.name]: e.target.value })
            }
            required={field.required}
            placeholder={field.placeholder}
            error={Boolean(errors?.[field.name])}
            helperText={errors?.[field.name] || " "}
            size="small"
            fullWidth
          />
        ))}

        <Button type="submit" variant="contained">
          {message?.buttonText || "Submit"}
        </Button>

        {message?.text ? <Alert severity="success">{message.text}</Alert> : null}
      </Stack>
    </Box>
  );
}
