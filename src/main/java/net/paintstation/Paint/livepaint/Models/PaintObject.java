package net.paintstation.Paint.livepaint.Models;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,   // use a name string (not a Java class name) to identify the type
        include = JsonTypeInfo.As.PROPERTY,        // that name is a regular field IN the JSON object
        property = "type"             // the field is called "type"
)
@JsonSubTypes({
        // "if type == STROKE, create a Stroke"
        @JsonSubTypes.Type(value = Stroke.class, name = "STROKE"),
        // "if type == DOT, create a SDOT"
        @JsonSubTypes.Type(value = Dot.class,  name = "DOT"),
})
public sealed interface PaintObject permits Stroke, Dot {

}
