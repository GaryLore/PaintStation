package net.paintstation.Paint.exception;

import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;


/**
 * This class will most likely barely run because the client provides validation, however in the case where a user were to change the JS code and bypass the validation
 * this class will return the errors cause by incorrect validation on the Server
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * This method will run if validation fails(MethodArgumentNotValidException.class) which will only
     * happen if the client were to bypass the frontend verification by editing the JavaScript code,
     * so this is just in case.
     *
     * @param ex The exception returned when validating the users input for creating or entering a room
     * @return errors list of errors
     */
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return errors;
    }
}
