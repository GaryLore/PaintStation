package net.paintstation.Paint.livepaint.Models;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.PROPERTY,
        property = "type"
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = Stroke.class, name = "STROKE"),
        @JsonSubTypes.Type(value = Dot.class,  name = "DOT"),
})
public sealed interface PaintObject permits Stroke, Dot {

    public String getType();
}
